import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MiniCogResults } from '@/types/dementia';

interface MiniCogTestProps {
  language: 'zh-HK' | 'zh-CN';
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  onComplete: (results: MiniCogResults) => void;
}

const MiniCogTest = ({
  language,
  isListening,
  startListening,
  stopListening,
  transcript,
  speak,
  isSpeaking,
  onComplete
}: MiniCogTestProps) => {
  const [step, setStep] = useState<'words' | 'clock' | 'recall'>('words');
  const [wordsRepeated, setWordsRepeated] = useState<string[]>([]);
  const [clockDrawn, setClockDrawn] = useState(false);
  const [recallWords, setRecallWords] = useState<string[]>([]);

  const miniCogWords = language === 'zh-HK' 
    ? ['蘋果', '筆', '鞋']
    : ['苹果', '笔', '鞋'];

  const texts = {
    'zh-HK': {
      wordsInstruction: '我會說三個詞，請你聽完後重複一次：蘋果、筆、鞋',
      clockInstruction: '謝謝你。接下來請你畫一個時鐘，指向11點10分。畫完後請說「完成」。',
      recallInstruction: '現在請你回憶剛才的三個詞。',
      completed: '已完成',
      next: '下一步'
    },
    'zh-CN': {
      wordsInstruction: '我会说三个词，请你听完后重复一次：苹果、笔、鞋',
      clockInstruction: '谢谢你。接下来请你画一个时钟，指向11点10分。画完后请说「完成」。',
      recallInstruction: '现在请你回忆刚才的三个词。',
      completed: '已完成',
      next: '下一步'
    }
  };

  useEffect(() => {
    if (step === 'words' && !isSpeaking) {
      speak(texts[language].wordsInstruction);
    }
  }, [step, language, speak, isSpeaking]);

  useEffect(() => {
    if (transcript && isListening) {
      handleResponse();
    }
  }, [transcript, isListening]);

  const handleResponse = () => {
    const response = transcript.trim();
    
    if (step === 'words') {
      const words = response.split(/[，,\s]+/).filter(word => word.length > 0);
      setWordsRepeated(words);
      stopListening();
      setTimeout(() => {
        speak(texts[language].clockInstruction).then(() => {
          setStep('clock');
        });
      }, 1000);
    } else if (step === 'clock') {
      if (response.includes('完成') || response.includes('好')) {
        setClockDrawn(true);
        stopListening();
        setTimeout(() => {
          speak(texts[language].recallInstruction).then(() => {
            setStep('recall');
          });
        }, 1000);
      }
    } else if (step === 'recall') {
      const words = response.split(/[，,\s]+/).filter(word => word.length > 0);
      setRecallWords(words);
      stopListening();
      calculateResults(words);
    }
  };

  const calculateResults = (recallWords: string[]) => {
    const recallScore = recallWords.filter(word => 
      miniCogWords.some(correctWord => word.includes(correctWord))
    ).length;
    
    // Clock score would typically be assessed manually, but for demo purposes:
    const clockScore = clockDrawn ? 2 : 0;
    
    const results: MiniCogResults = {
      recallScore,
      clockScore,
      total: recallScore + clockScore,
      type: 'mini-cog'
    };
    
    onComplete(results);
  };

  const forceNext = () => {
    if (step === 'words') {
      speak(texts[language].clockInstruction).then(() => {
        setStep('clock');
      });
    } else if (step === 'clock') {
      setClockDrawn(true);
      speak(texts[language].recallInstruction).then(() => {
        setStep('recall');
      });
    } else if (step === 'recall') {
      calculateResults([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Mini-Cog {language === 'zh-HK' ? '測驗' : '测验'}</h2>
        <div className="flex justify-center space-x-2 mb-4">
          {['words', 'clock', 'recall'].map((s, i) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-primary text-primary-foreground' : 
                ['words', 'clock', 'recall'].indexOf(step) > i ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6">
        {step === 'words' && (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'zh-HK' ? '記憶測試' : '记忆测试'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'zh-HK' 
                ? '請重複我剛才說的三個詞'
                : '请重复我刚才说的三个词'}
            </p>
            {wordsRepeated.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{language === 'zh-HK' ? '您說的詞語：' : '您说的词语：'}</p>
                <p>{wordsRepeated.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {step === 'clock' && (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'zh-HK' ? '時鐘繪畫測試' : '时钟绘画测试'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'zh-HK' 
                ? '請畫一個時鐘，指向11點10分，完成後說「完成」'
                : '请画一个时钟，指向11点10分，完成后说「完成」'}
            </p>
            <div className="border-2 border-dashed border-muted h-48 flex items-center justify-center">
              <p className="text-muted-foreground">
                {language === 'zh-HK' ? '請在紙上畫時鐘' : '请在纸上画时钟'}
              </p>
            </div>
          </div>
        )}

        {step === 'recall' && (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'zh-HK' ? '回憶測試' : '回忆测试'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'zh-HK' 
                ? '請說出開始時我提到的三個詞'
                : '请说出开始时我提到的三个词'}
            </p>
            {recallWords.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{language === 'zh-HK' ? '您回憶的詞語：' : '您回忆的词语：'}</p>
                <p>{recallWords.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {transcript && (
        <Card className="p-4 bg-muted">
          <p className="text-sm">
            <strong>{language === 'zh-HK' ? '聽到：' : '听到：'}</strong> {transcript}
          </p>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={forceNext} variant="outline" disabled={isSpeaking}>
          {texts[language].next}
        </Button>
      </div>
    </div>
  );
};

export default MiniCogTest;