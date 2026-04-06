import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
// @ts-ignore

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('⚠️ OPENAI_API_KEY is not defined. AI features will be disabled.');
      this.openai = null as any;
    } else {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey,
        });
        this.logger.log('OpenAI client initialized successfully.');
      } catch (e) {
        this.logger.error('Failed to initialize OpenAI client:', e);
        this.openai = null as any;
      }
    }
  }

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      this.logger.log('Extracting text from PDF...');
      
      // pdf-parse 라이브러리는 버전에 따라 export 방식이 다를 수 있음 (함수 vs {PDFParse})
      const pdf = require('pdf-parse');
      let data: any;

      if (typeof pdf === 'function') {
        data = await pdf(buffer);
      } else if (pdf && typeof pdf.PDFParse === 'function') {
        const parser = new pdf.PDFParse({ data: buffer });
        data = await parser.getText();
        if (typeof parser.destroy === 'function') await parser.destroy();
      } else {
        throw new Error('pdf-parse 라이브러리 구조를 파악할 수 없습니다.');
      }

      return data.text || '';
    } catch (error) {
      this.logger.error('Failed to extract text from PDF', error);
      throw new Error('PDF 텍스트 추출에 실패했습니다.');
    }
  }

  async analyzeContract(text: string): Promise<{
    riskScore: number;
    riskAnalysis: string;
  }> {
    try {
      this.logger.log('Sending contract text to OpenAI for Korean legal analysis...');
      
      const prompt = `
        당신은 한국 법률 및 기업 간 계약서(NDA 등) 분석에 정통한 전문 변호사 AI입니다.
        주어진 계약서를 분석하고, 다음의 한국 법률 실무 및 시장 표준에 맞춰 위험도를 평가한 후 정형화된 JSON 형태로 응답해 주세요.

        ### 분석 프레임워크 (Analytical Framework):
        1. **계약 당사자 및 기본 요건 확인 (Context & Pre-Review)**:
           - 당사가 '정보 제공자(Disclosing Party)'인지 '정보 수령자(Receiving Party)'인지, 혹은 양방향(Mutual)인지 파악하세요. 입장에 따라 유리/불리한 조항이 달라집니다.
           - 계약 당사자 정보 공란, 계약 기간, 관할 법원(대한민국 외 지역인지 여부)을 확인하세요.
        2. **핵심 독소조항 및 위험 요소 탐지 (Red Flag Detection)**:
           - 과도한 손해배상액의 예정이나 위약벌 조항
           - 일방적인 계약 해지권 또는 불리한 계약 변경 조항
           - 기밀유지 의무의 예외 조항 누락 (표준 예외 조항 4가지)
           - 계약 종료 후 잔존 정보(Residuals) 처리 및 비밀유지 존속 기간의 적절성 (보통 1~3년)
           - 부당한 경업금지 의무 부과 여부
        3. **우선순위 기반 이슈 분류 (Issue Prioritization)**:
           - 발견된 이슈를 단순히 나열하지 말고, 서명 전 반드시 수정해야 하는 치명적 결함(Critical)과 감수할 수 있으나 주의가 필요한 항목(Important)으로 명확히 무게를 나누어 평가하세요.

        ### 응답 포맷 (MUST be strict JSON):
        {
          "riskScore": (숫자 0-100, 100이 가장 치명적인 위험),
          "riskLevel": "Low" | "Medium" | "High",
          "summary": "계약서의 전반적인 위험도와 실무적 종합 의견 (한국어)",
          "partyContext": "계약의 성격 및 당사의 지위(제공자/수령자)에 따른 분석 의견",
          "redFlags": [ 
            { "flag": "string(조항명)", "issue": "string(문제점)", "location": "string(제O조)" } 
          ],
          "marketStandards": [ 
            { "term": "string(항목)", "found_value": "string(계약서상 내용)", "standard": "string(한국 실무 표준)", "gap": "string(차이점)" } 
          ],
          "detailedAnalysis": {
             "critical": [ { "clause": "string", "issue": "string", "redline": "string(한국 법률가 톤앤매너의 수정 권고사항)" } ],
             "important": [ { "clause": "string", "issue": "string", "redline": "string" } ],
             "acceptable": [ { "clause": "string", "reason": "string(수용 가능한 이유)" } ]
          }
        }

        계약서 내용:
        ${text.substring(0, 7000)}
      `;

      if (!this.openai) {
        this.logger.error('OpenAI client is not initialized (API key might be missing).');
        throw new Error('AI 분석 기능이 활성화되지 않았습니다. 관리자에게 문의하세요.');
      }

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional Korean legal contract analysis expert. Always output JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const responseContent = response.choices[0].message.content || '{}';
      this.logger.log(
        `OpenAI response received. model=${process.env.OPENAI_MODEL || 'gpt-4o-mini'} contentLength=${responseContent.length}`,
      );

      let result: any;
      try {
        result = JSON.parse(responseContent);
      } catch (parseError) {
        this.logger.error('Failed to parse OpenAI JSON response', parseError);
        throw new Error('AI 응답 데이터 형식이 올바르지 않습니다.');
      }

      // 모델 응답 스키마 검증: riskScore 범위 체크 및 타입 강제
      const parsedRiskScore = Number(result.riskScore);
      const riskScore = Number.isFinite(parsedRiskScore)
        ? Math.min(100, Math.max(0, parsedRiskScore))
        : 0;

      // 배열 필드 구조 검증
      const redFlags = Array.isArray(result.redFlags) ? result.redFlags : [];
      const marketStandards = Array.isArray(result.marketStandards) ? result.marketStandards : [];

      // 상세 분석 객체 구조 검증
      const detailedAnalysis =
        result.detailedAnalysis && typeof result.detailedAnalysis === 'object'
          ? {
              critical: Array.isArray(result.detailedAnalysis.critical) ? result.detailedAnalysis.critical : [],
              important: Array.isArray(result.detailedAnalysis.important) ? result.detailedAnalysis.important : [],
              acceptable: Array.isArray(result.detailedAnalysis.acceptable) ? result.detailedAnalysis.acceptable : [],
            }
          : { critical: [], important: [], acceptable: [] };

      return {
        riskScore,
        riskAnalysis: JSON.stringify({
          overall: result.riskLevel || 'Low',
          summary: result.summary || '분석된 특별한 위험 요소가 없습니다.',
          partyContext: result.partyContext || '당사자 지위를 명확히 파악할 수 없습니다.',
          redFlags,
          marketStandards,
          detailedAnalysis,
        }),
      };
    } catch (error) {
      this.logger.error('OpenAI analysis failed', error);
      throw new Error('AI 계약 분석 중 오류가 발생했습니다.');
    }
  }
}
