import { useState, useEffect } from 'react';
import { CallData, DashboardMetrics, ChartData } from '../types';
import { vapiApi } from '../services/vapiApi';

export const useVapiData = (userId: string | undefined) => {
  const [callData, setCallData] = useState<CallData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(false);

  // Mock data generation for demonstration
  const generateMockData = (): CallData[] => {
    const assistants = ['Sarah (Main)', 'Mike (Backup)', 'Emily (Evening)'];
    const endReasons: CallData['endReason'][] = ['customer_hangup', 'customer_complete', 'assistant_hangup', 'system_error', 'timeout'];
    const mockCalls: CallData[] = [];

    for (let i = 0; i < 147; i++) {
      const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 600) + 30; // 30s to 10min
      const endTime = new Date(startTime.getTime() + duration * 1000);

      mockCalls.push({
        id: `call_${i + 1}`,
        assistantId: `assistant_${i % 3 + 1}`,
        assistantName: assistants[i % 3],
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        endReason: endReasons[Math.floor(Math.random() * endReasons.length)],
        transcript: `Customer called regarding ${['appointment booking', 'product inquiry', 'order status', 'general information', 'complaint'][Math.floor(Math.random() * 5)]}. The conversation was handled professionally and the customer's needs were addressed.`,
        audioUrl: `https://example.com/audio/call_${i + 1}.mp3`,
        customerPhone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        successRating: Math.floor(Math.random() * 40) + 60, // 60-100
        cost: Math.random() * 2 + 0.1 // $0.10 - $2.10
      });
    }

    return mockCalls.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  };

  const calculateMetrics = (calls: CallData[]): DashboardMetrics => {
    const totalCallMinutes = calls.reduce((sum, call) => sum + call.duration, 0) / 60;
    const completedCalls = calls.filter(call => call.status === 'completed');
    const successfulCalls = calls.filter(call => call.successRating >= 70);
    
    return {
      totalCallMinutes: Math.round(totalCallMinutes * 10) / 10,
      totalCalls: calls.length,
      averageCallDuration: Math.round((totalCallMinutes / calls.length) * 60),
      callSuccessRate: Math.round((successfulCalls.length / calls.length) * 100),
      totalCost: Math.round(calls.reduce((sum, call) => sum + call.cost, 0) * 100) / 100
    };
  };

  const generateChartData = (calls: CallData[]): ChartData => {
    // End reasons distribution
    const endReasonCounts = calls.reduce((acc, call) => {
      acc[call.endReason] = (acc[call.endReason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const endReasons = Object.entries(endReasonCounts).map(([reason, count]) => ({
      reason: reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: Math.round((count / calls.length) * 100)
    }));

    // Assistant durations
    const assistantStats = calls.reduce((acc, call) => {
      if (!acc[call.assistantName]) {
        acc[call.assistantName] = { totalDuration: 0, callCount: 0 };
      }
      acc[call.assistantName].totalDuration += call.duration;
      acc[call.assistantName].callCount += 1;
      return acc;
    }, {} as Record<string, { totalDuration: number; callCount: number }>);

    const assistantDurations = Object.entries(assistantStats).map(([assistant, stats]) => ({
      assistant,
      avgDuration: Math.round(stats.totalDuration / stats.callCount),
      callCount: stats.callCount
    }));

    // Success distribution
    const successRanges = ['60-70', '71-80', '81-90', '91-100'];
    const successDistribution = successRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      const count = calls.filter(call => call.successRating >= min && call.successRating <= max).length;
      return { range, count };
    });

    // Daily call volume (last 7 days)
    const dailyCallVolume = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daysCalls = calls.filter(call => call.startTime.startsWith(dateStr));
      const totalMinutes = daysCalls.reduce((sum, call) => sum + call.duration, 0) / 60;
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calls: daysCalls.length,
        minutes: Math.round(totalMinutes * 10) / 10
      };
    }).reverse();

    return { endReasons, assistantDurations, successDistribution, dailyCallVolume };
  };

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let calls: CallData[] = [];
        
        if (useRealData) {
          try {
            console.log('Fetching real data from Vapi API...');
            // Fetch real data from Vapi API
            calls = await vapiApi.getCalls({
              limit: 50,
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            });
            console.log('Successfully fetched calls from Vapi:', calls.length);
            
            // If no calls returned, show a message but don't fall back to mock data
            if (calls.length === 0) {
              console.log('No calls found in Vapi account');
              setCallData([]);
              setMetrics({
                totalCallMinutes: 0,
                totalCalls: 0,
                averageCallDuration: 0,
                callSuccessRate: 0,
                totalCost: 0
              });
              setChartData({
                endReasons: [],
                assistantDurations: [],
                successDistribution: [],
                dailyCallVolume: []
              });
              setLoading(false);
              return;
            }
          } catch (apiError) {
            console.error('Failed to fetch from Vapi API:', apiError);
            const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
            
            if (errorMessage.includes('Invalid Key') || errorMessage.includes('Unauthorized')) {
              setError('Invalid API Key: Please check that you\'re using your Public API Key (not Private Key) from your Vapi Dashboard. Public keys are safe for frontend use.');
            } else {
              setError(`Failed to connect to Vapi API: ${errorMessage}`);
            }
            setLoading(false);
            return;
          }
        } else {
          // Use mock data for demonstration
          console.log('Using mock data for demonstration');
          await new Promise(resolve => setTimeout(resolve, 1500));
          calls = generateMockData();
        }

        const calculatedMetrics = calculateMetrics(calls);
        const chartAnalytics = generateChartData(calls);

        setCallData(calls);
        setMetrics(calculatedMetrics);
        setChartData(chartAnalytics);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch call data';
        setError(errorMessage);
        console.error('Error fetching Vapi data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, useRealData]);

  const refreshData = () => {
    if (userId) {
      setLoading(true);
      // Trigger data refetch
      const mockCalls = generateMockData();
      const calculatedMetrics = calculateMetrics(mockCalls);
      const chartAnalytics = generateChartData(mockCalls);

      setTimeout(() => {
        setCallData(mockCalls);
        setMetrics(calculatedMetrics);
        setChartData(chartAnalytics);
        setLoading(false);
      }, 1000);
    }
  };

  const toggleDataSource = () => {
    setUseRealData(!useRealData);
  };

  return { 
    callData, 
    metrics, 
    chartData, 
    loading, 
    error, 
    refreshData, 
    useRealData, 
    toggleDataSource 
  };
};