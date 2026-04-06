import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import * as fs from 'fs';
import * as path from 'path';

// pdf-parse 동작 모킹 (AiService의 named export PDFParse 사용에 맞춤)
jest.mock('pdf-parse', () => {
  const mockGetText = jest.fn().mockImplementation(function(this: any) {
    // @ts-ignore
    const buffer = this.data;
    if (buffer && buffer.toString('utf-8') === 'invalid pdf data') {
      return Promise.reject(new Error('Invalid PDF 구조'));
    }
    return Promise.resolve({
      text: (buffer && buffer.length > 0) 
        ? '이것은 임대차 혹은 기밀유지 계약서 파싱 결과입니다. (Mocked Data)' 
        : ''
    });
  });

  return {
    PDFParse: jest.fn().mockImplementation(function(this: any, { data }) {
      this.data = data;
      this.getText = mockGetText;
      this.destroy = jest.fn().mockResolvedValue(undefined);
    })
  };
});


describe('AiService', () => {
  let service: AiService;

  beforeAll(() => {
    // 테스트용 임시 API KEY 설정
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractTextFromPdf', () => {
    it('should extract text from mock PDF buffer', async () => {
      const buffer = Buffer.from('dummy-content', 'utf-8');
      const text = await service.extractTextFromPdf(buffer);
      
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
      expect(text).toContain('(Mocked Data)');
      expect(text.length).toBeGreaterThan(10);
    });

    it('should throw an error if pdf extraction fails (invalid buffer)', async () => {
      const invalidBuffer = Buffer.from('invalid pdf data', 'utf-8');
      await expect(service.extractTextFromPdf(invalidBuffer)).rejects.toThrow('PDF 텍스트 추출에 실패했습니다.');
    });
  });

  describe('analyzeContract', () => {
    it('should analyze contract and return properly mapped JSON object', async () => {
      // Mock OpenAI chat completion
      const mockResult = {
        riskScore: 65,
        riskLevel: 'Medium',
        summary: '이 계약은 보통 수준의 위험을 가집니다.',
        partyContext: '제공자 입장에서 분석됨.',
        redFlags: [
          { flag: '손해배상', issue: '배상액 과다', location: '제5조' }
        ],
        marketStandards: [],
        detailedAnalysis: {
          critical: [],
          important: [{ clause: '기밀유지', issue: '기간 초과', redline: '3년으로 단축' }],
          acceptable: []
        }
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(mockResult),
            },
          },
        ],
      };

      // ai.service.ts에서 this.openai = new OpenAI() 로 할당했으므로, 인스턴스의 함수를 스파이 처리
      const createSpy = jest
        //@ts-ignore
        .spyOn(service.openai.chat.completions, 'create')
        .mockResolvedValue(mockResponse as any);

      const fakeContractText = '본 계약은 임대인과 임차인 간의 계약이다.';
      const result = await service.analyzeContract(fakeContractText);

      expect(createSpy).toHaveBeenCalled();
      expect(result.riskScore).toBe(65);
      
      // JSON 객체 파싱 후 내부 검증
      const parsedAnalysis = JSON.parse(result.riskAnalysis);
      expect(parsedAnalysis.overall).toBe('Medium');
      expect(parsedAnalysis.redFlags.length).toBe(1);
      expect(parsedAnalysis.redFlags[0].flag).toBe('손해배상');
    });

    it('should handle API failure gracefully with exception', async () => {
      // API 통신 에러 발생
      const createSpy = jest
        //@ts-ignore
        .spyOn(service.openai.chat.completions, 'create')
        .mockRejectedValue(new Error('OpenAI Server Error'));

      const fakeContractText = 'This is a test';
      await expect(service.analyzeContract(fakeContractText)).rejects.toThrow('AI 계약 분석 중 오류가 발생했습니다.');
    });
  });
});
