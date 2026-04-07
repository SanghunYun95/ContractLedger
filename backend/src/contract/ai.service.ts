import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      this.logger.warn('⚠️ [AiService] OPENAI_API_KEY is not defined or empty. AI analysis will fail.');
      this.openai = null as any;
    } else {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey,
        });
        this.logger.log(`[AiService] OpenAI client initialized (Model: ${model}). Key length: ${apiKey.length}`);
      } catch (e) {
        this.logger.error('[AiService] Failed to initialize OpenAI client:', e);
        this.openai = null as any;
      }
    }
  }

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      this.logger.log(`[AiService] Extracting text from PDF (Buffer size: ${buffer.length} bytes)...`);
      
      // pdf-parse dynamic import (to handle potential env issues)
      const pdf = require('pdf-parse');
      let data: any;

      if (typeof pdf === 'function') {
        data = await pdf(buffer);
      } else if (pdf && typeof pdf.PDFParse === 'function') {
        const parser = new pdf.PDFParse({ data: buffer });
        data = await parser.getText();
        if (typeof parser.destroy === 'function') await parser.destroy();
      } else {
        this.logger.error('[AiService] pdf-parse structure is unknown or not a function');
        throw new Error('PDF 파서 라이브러리 연동에 문제가 있습니다.');
      }

      const text = data.text || '';
      this.logger.log(`[AiService] PDF text extraction complete. Extracted length: ${text.length} chars.`);
      return text;
    } catch (error) {
      this.logger.error('[AiService] Failed to extract text from PDF:', error);
      throw new InternalServerErrorException(`PDF 텍스트 추출 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  async analyzeContract(text: string): Promise<{
    riskScore: number;
    riskAnalysis: string;
  }> {
    try {
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      this.logger.log(`[AiService] Starting AI analysis with model: ${model} (Text length: ${text.length})...`);
      
      if (!this.openai) {
        this.logger.error('[AiService] OpenAI client is not initialized. Check OPENAI_API_KEY environment variable.');
        throw new InternalServerErrorException('AI 서비스가 설정되지 않았습니다. 관리자에게 API 키 설정을 문의해 주세요.');
      }

      const prompt = `
        당신은 한국 법률 및 기업 간 계약서(NDA 등) 분석에 정통한 전문 변호사 AI입니다.
        주어진 계약서를 분석하고, 다음의 한국 법률 실무 및 시장 표준에 맞춰 위험도를 평가한 후 정형화된 JSON 형태로 응답해 주세요.

        ### 분석 프레임워크 (Analytical Framework):
        1. **계약 당사자 및 기본 요건 확인 (Context & Pre-Review)**:
           - 당사가 '정보 제공자(Disclosing Party)'인지 '정보 수령자(Receiving Party)'인지, 혹은 양방향(Mutual)인지 파악하세요.
           - 당사자 정보 공란, 계약 기간, 관할 법원(대한민국 외 지역인지 여부)을 확인하세요.
        2. **핵심 독소조항 및 위험 요소 탐지 (Red Flag Detection)**:
           - 과도한 손해배상액 또는 위약벌 조항
           - 일방적인 계약 해지권 또는 불리한 계약 변경 조항
           - 기밀유지 의무의 예외 조항 누락
           - 계약 종료 후 보관 정보 처리 및 비밀유지 존속 기간의 적절성
        3. **우선순위 기반 이슈 분류 (Issue Prioritization)**:
           - 치명적 결함(Critical)과 주의가 필요한 항목(Important)으로 나누어 평가하세요.

        ### 응답 포맷 (MUST be strict JSON):
        {
          "riskScore": (숫자 0-100, 100이 가장 치명적인 위험),
          "riskLevel": "Low" | "Medium" | "High",
          "summary": "계약서의 전반적인 위험도와 실무적 종합 의견 (한국어)",
          "partyContext": "계약의 성격 및 당사의 지위(제공자/수령자)에 따른 분석 의견",
          "redFlags": [ { "flag": "string", "issue": "string", "location": "string" } ],
          "marketStandards": [ { "term": "string", "found_value": "string", "standard": "string", "gap": "string" } ],
          "detailedAnalysis": {
             "critical": [ { "clause": "string", "issue": "string", "redline": "string" } ],
             "important": [ { "clause": "string", "issue": "string", "redline": "string" } ],
             "acceptable": [ { "clause": "string", "reason": "string" } ]
          }
        }

        계약서 내용:
        ${text.substring(0, 8000)}
      `;

      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: 'You are a professional Korean legal contract analysis expert. Always output dynamic JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const responseContent = response.choices[0].message.content || '{}';
      this.logger.log(`[AiService] OpenAI response received. Length: ${responseContent.length} bytes`);

      let result: any;
      try {
        result = JSON.parse(responseContent);
      } catch (parseError) {
        this.logger.error('[AiService] Failed to parse OpenAI JSON response:', parseError);
        this.logger.debug(`[AiService] Raw response content: ${responseContent}`);
        throw new InternalServerErrorException('AI 응답 데이터 형식이 올바르지 않습니다.');
      }

      // 데이터 정규화 및 검증
      const parsedRiskScore = Number(result.riskScore);
      const riskScore = Number.isFinite(parsedRiskScore) ? Math.min(100, Math.max(0, parsedRiskScore)) : 50;

      const riskAnalysis = JSON.stringify({
        overall: result.riskLevel || 'Medium',
        summary: result.summary || '분석 요약 정보를 생성할 수 없습니다.',
        partyContext: result.partyContext || '당사자 지위 분석 정보가 누락되었습니다.',
        redFlags: Array.isArray(result.redFlags) ? result.redFlags : [],
        marketStandards: Array.isArray(result.marketStandards) ? result.marketStandards : [],
        detailedAnalysis: {
          critical: Array.isArray(result?.detailedAnalysis?.critical) ? result.detailedAnalysis.critical : [],
          important: Array.isArray(result?.detailedAnalysis?.important) ? result.detailedAnalysis.important : [],
          acceptable: Array.isArray(result?.detailedAnalysis?.acceptable) ? result.detailedAnalysis.acceptable : [],
        }
      });

      this.logger.log('[AiService] Contract analysis successfully completed and normalized.');
      return {
        riskScore,
        riskAnalysis,
      };
    } catch (error) {
      this.logger.error('[AiService] OpenAI analysis totally failed:', error);
      throw new InternalServerErrorException(`AI 계약 분석 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}
[];
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
