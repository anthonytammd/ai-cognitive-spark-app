import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MiniCogResults, SlumsResults } from '@/types/dementia';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface TestResultsProps {
  results: MiniCogResults | SlumsResults;
  language: 'zh-HK' | 'zh-CN';
  onRestart: () => void;
}

const TestResults = ({ results, language, onRestart }: TestResultsProps) => {
  const getText = (key: string) => {
    const texts = {
      'zh-HK': {
        title: '測驗結果',
        miniCogTitle: 'Mini-Cog 測驗結果',
        slumsTitle: 'SLUMS 測驗結果',
        recallScore: '記憶回憶分數',
        clockScore: '時鐘繪畫分數',
        totalScore: '總分',
        interpretation: '結果解釋',
        normal: '正常認知功能',
        mildImpairment: '輕度認知障礙',
        severeImpairment: '認知功能明顯受損',
        recommendation: '建議',
        normalRec: '您的認知功能表現正常。建議保持健康的生活方式。',
        mildRec: '建議諮詢醫生進行進一步評估。',
        severeRec: '強烈建議盡快諮詢專業醫生進行詳細檢查。',
        restart: '重新開始測驗',
        disclaimer: '免責聲明：此測驗僅供參考，不能替代專業醫療診斷。如有疑慮，請諮詢合格的醫療專業人員。'
      },
      'zh-CN': {
        title: '测验结果',
        miniCogTitle: 'Mini-Cog 测验结果',
        slumsTitle: 'SLUMS 测验结果',
        recallScore: '记忆回忆分数',
        clockScore: '时钟绘画分数',
        totalScore: '总分',
        interpretation: '结果解释',
        normal: '正常认知功能',
        mildImpairment: '轻度认知障碍',
        severeImpairment: '认知功能明显受损',
        recommendation: '建议',
        normalRec: '您的认知功能表现正常。建议保持健康的生活方式。',
        mildRec: '建议咨询医生进行进一步评估。',
        severeRec: '强烈建议尽快咨询专业医生进行详细检查。',
        restart: '重新开始测验',
        disclaimer: '免责声明：此测验仅供参考，不能替代专业医疗诊断。如有疑虑，请咨询合格的医疗专业人员。'
      }
    };
    return texts[language][key as keyof typeof texts[typeof language]] || '';
  };

  const getInterpretation = () => {
    if (results.type === 'mini-cog') {
      const miniCogResults = results as MiniCogResults;
      if (miniCogResults.total >= 5) {
        return {
          level: getText('normal'),
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          recommendation: getText('normalRec'),
          color: 'text-green-600'
        };
      } else if (miniCogResults.total >= 3) {
        return {
          level: getText('mildImpairment'),
          icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
          recommendation: getText('mildRec'),
          color: 'text-yellow-600'
        };
      } else {
        return {
          level: getText('severeImpairment'),
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          recommendation: getText('severeRec'),
          color: 'text-red-600'
        };
      }
    } else {
      const slumsResults = results as SlumsResults;
      const percentage = (slumsResults.score / slumsResults.maxScore) * 100;
      
      if (percentage >= 80) {
        return {
          level: getText('normal'),
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          recommendation: getText('normalRec'),
          color: 'text-green-600'
        };
      } else if (percentage >= 60) {
        return {
          level: getText('mildImpairment'),
          icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
          recommendation: getText('mildRec'),
          color: 'text-yellow-600'
        };
      } else {
        return {
          level: getText('severeImpairment'),
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          recommendation: getText('severeRec'),
          color: 'text-red-600'
        };
      }
    }
  };

  const interpretation = getInterpretation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{getText('title')}</h2>
      </div>

      <Card className="p-6">
        <div className="text-center space-y-6">
          <h3 className="text-xl font-semibold">
            {results.type === 'mini-cog' ? getText('miniCogTitle') : getText('slumsTitle')}
          </h3>

          <div className="flex justify-center mb-4">
            {interpretation.icon}
          </div>

          {results.type === 'mini-cog' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{getText('recallScore')}</p>
                  <p className="text-2xl font-bold">{(results as MiniCogResults).recallScore}/3</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{getText('clockScore')}</p>
                  <p className="text-2xl font-bold">{(results as MiniCogResults).clockScore}/2</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{getText('totalScore')}</p>
                  <p className="text-2xl font-bold">{(results as MiniCogResults).total}/5</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{getText('totalScore')}</p>
                <p className="text-2xl font-bold">
                  {(results as SlumsResults).score}/{(results as SlumsResults).maxScore}
                </p>
                <p className="text-sm text-muted-foreground">
                  ({Math.round(((results as SlumsResults).score / (results as SlumsResults).maxScore) * 100)}%)
                </p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-2">{getText('interpretation')}</h4>
            <p className={`text-lg font-medium ${interpretation.color}`}>
              {interpretation.level}
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-2">{getText('recommendation')}</h4>
            <p className="text-muted-foreground">{interpretation.recommendation}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>{getText('disclaimer').split('：')[0]}：</strong>
          {getText('disclaimer').split('：')[1]}
        </p>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onRestart} className="px-8 py-2">
          {getText('restart')}
        </Button>
      </div>
    </div>
  );
};

export default TestResults;