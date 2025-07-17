import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { TestStep } from '@/types/dementia';
import MiniCogTest from './MiniCogTest';
import SlumsTest from './SlumsTest';
import TestResults from './TestResults';
import { Mic, MicOff } from 'lucide-react';

const DementiaScreeningApp = () => {
  const [currentStep, setCurrentStep] = useState<TestStep>('intro');
  const [language, setLanguage] = useState<'zh-HK' | 'zh-CN'>('zh-HK');
  const [testResults, setTestResults] = useState<any>(null);
  
  const { isListening, startListening, stopListening, transcript } = useSpeechRecognition(language);
  const { speak, isSpeaking } = useSpeechSynthesis(language);

  const startScreening = async () => {
    const welcomeText = language === 'zh-HK' 
      ? '你好！很高興見到你！我是你的語音助手。今天我們會聊聊天，做一些輕鬆的小測驗，就像朋友之間的對話一樣。放輕鬆就好，我們開始吧！'
      : '你好！很高兴见到你！我是你的语音助手。今天我们会聊聊天，做一些轻松的小测验，就像朋友之间的对话一样。放轻松就好，我们开始吧！';
    
    await speak(welcomeText);
    setCurrentStep('mini-cog');
  };

  const handleMiniCogComplete = async (results: any) => {
    if (results.total >= 5) {
      setTestResults(results);
      setCurrentStep('results');
      await speak(language === 'zh-HK' ? '太棒了！你做得非常好，我們的小測驗就到這裡。謝謝你今天跟我聊天！' : '太棒了！你做得非常好，我们的小测验就到这里。谢谢你今天跟我聊天！');
    } else {
      await speak(language === 'zh-HK' ? '好的，你做得很不錯！讓我們再聊聊其他的話題，多了解一下你的情況。' : '好的，你做得很不错！让我们再聊聊其他的话题，多了解一下你的情况。');
      setCurrentStep('slums');
    }
  };

  const handleSlumsComplete = (results: any) => {
    setTestResults(results);
    setCurrentStep('results');
  };

  const resetTest = () => {
    setCurrentStep('intro');
    setTestResults(null);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {language === 'zh-HK' ? '語音失智篩查系統' : '语音失智筛查系统'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'zh-HK' 
                ? 'AI 驅動的認知評估工具' 
                : 'AI 驱动的认知评估工具'}
            </p>
          </div>

          {currentStep === 'intro' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {language === 'zh-HK' ? '選擇語言' : '选择语言'}
                </h2>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant={language === 'zh-HK' ? 'default' : 'outline'}
                    onClick={() => setLanguage('zh-HK')}
                  >
                    廣東話
                  </Button>
                  <Button 
                    variant={language === 'zh-CN' ? 'default' : 'outline'}
                    onClick={() => setLanguage('zh-CN')}
                  >
                    普通话
                  </Button>
                </div>
              </div>

              <Button 
                onClick={startScreening}
                className="text-lg px-8 py-4"
                disabled={isSpeaking}
              >
                {language === 'zh-HK' ? '開始篩查' : '开始筛查'}
              </Button>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {language === 'zh-HK' 
                    ? '此測驗包括 Mini-Cog 和 SLUMS 認知評估。請確保您在安靜的環境中進行測驗。'
                    : '此测验包括 Mini-Cog 和 SLUMS 认知评估。请确保您在安静的环境中进行测验。'}
                </p>
              </div>
            </div>
          )}

          {currentStep === 'mini-cog' && (
            <MiniCogTest
              language={language}
              isListening={isListening}
              startListening={startListening}
              stopListening={stopListening}
              transcript={transcript}
              speak={speak}
              isSpeaking={isSpeaking}
              onComplete={handleMiniCogComplete}
            />
          )}

          {currentStep === 'slums' && (
            <SlumsTest
              language={language}
              isListening={isListening}
              startListening={startListening}
              stopListening={stopListening}
              transcript={transcript}
              speak={speak}
              isSpeaking={isSpeaking}
              onComplete={handleSlumsComplete}
            />
          )}

          {currentStep === 'results' && testResults && (
            <TestResults
              results={testResults}
              language={language}
              onRestart={resetTest}
            />
          )}

          {(currentStep === 'mini-cog' || currentStep === 'slums') && (
            <div className="flex justify-center mt-6">
              <Button
                variant={isListening ? "destructive" : "default"}
                onClick={isListening ? stopListening : startListening}
                className="flex items-center gap-2"
                disabled={isSpeaking}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening 
                  ? (language === 'zh-HK' ? '停止錄音' : '停止录音')
                  : (language === 'zh-HK' ? '開始錄音' : '开始录音')
                }
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DementiaScreeningApp;