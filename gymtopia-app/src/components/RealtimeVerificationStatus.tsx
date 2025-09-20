'use client';

import { useState, useEffect, useRef } from 'react';
import { Shield, Loader2, CheckCircle, AlertTriangle, XCircle, Satellite, Target } from 'lucide-react';
import { getCurrentPosition, verifyDistanceToGym, detectLocationSpoofing, type Coordinates } from '@/lib/gps-verification';

interface VerificationStatus {
  phase: 'idle' | 'locating' | 'verifying' | 'completed' | 'failed';
  accuracy?: number;
  distance?: number;
  confidence?: 'high' | 'medium' | 'low';
  spoofingRisk?: 'low' | 'medium' | 'high';
  message: string;
  progress: number;
}

interface RealtimeVerificationStatusProps {
  gymLocation?: { latitude: number; longitude: number };
  isActive: boolean;
  onVerificationComplete?: (result: {
    success: boolean;
    userLocation?: Coordinates;
    verification?: any;
  }) => void;
}

export default function RealtimeVerificationStatus({
  gymLocation,
  isActive,
  onVerificationComplete
}: RealtimeVerificationStatusProps) {
  const [status, setStatus] = useState<VerificationStatus>({
    phase: 'idle',
    message: 'GPS認証待機中...',
    progress: 0
  });

  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const verificationTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive && gymLocation) {
      startVerification();
    } else {
      resetVerification();
    }

    return () => {
      if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isActive, gymLocation]);

  const startVerification = async () => {
    setStatus({
      phase: 'locating',
      message: 'GPS位置情報を取得中...',
      progress: 10
    });

    // プログレスバーアニメーション
    let currentProgress = 10;
    progressIntervalRef.current = setInterval(() => {
      if (currentProgress < 80) {
        currentProgress += Math.random() * 10;
        setStatus(prev => ({
          ...prev,
          progress: Math.min(currentProgress, 80)
        }));
      }
    }, 500);

    try {
      // GPS位置情報取得
      const position = await getCurrentPosition({
        requiredAccuracy: 30,
        timeoutMs: 15000,
        enableHighAccuracy: true
      });

      setUserLocation(position);

      setStatus({
        phase: 'verifying',
        message: 'GPS認証を実行中...',
        progress: 85,
        accuracy: position.accuracy
      });

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      // 位置偽装チェック
      const spoofCheck = detectLocationSpoofing(position);

      // 距離認証
      const verification = verifyDistanceToGym(position, gymLocation);

      // 最終結果判定
      const success = verification.isValid && spoofCheck.riskLevel !== 'high';

      setStatus({
        phase: success ? 'completed' : 'failed',
        message: success
          ? `GPS認証成功！ (${verification.distance.toFixed(0)}m, 精度: ${position.accuracy?.toFixed(0)}m)`
          : `GPS認証失敗: ${getFailureReason(verification, spoofCheck)}`,
        progress: 100,
        accuracy: position.accuracy,
        distance: verification.distance,
        confidence: verification.confidenceLevel,
        spoofingRisk: spoofCheck.riskLevel
      });

      // 結果をコールバック
      onVerificationComplete?.({
        success,
        userLocation: position,
        verification: {
          ...verification,
          spoofCheck,
          riskLevel: spoofCheck.riskLevel
        }
      });

    } catch (error) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      setStatus({
        phase: 'failed',
        message: `GPS取得失敗: ${error instanceof Error ? error.message : '不明なエラー'}`,
        progress: 0
      });

      onVerificationComplete?.({
        success: false
      });
    }
  };

  const resetVerification = () => {
    setStatus({
      phase: 'idle',
      message: 'GPS認証待機中...',
      progress: 0
    });
    setUserLocation(null);

    if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const getFailureReason = (verification: any, spoofCheck: any): string => {
    if (spoofCheck.riskLevel === 'high') {
      return '位置情報偽装の疑いが検出されました';
    }
    if (!verification.isValid) {
      return `距離が遠すぎます (${verification.distance.toFixed(0)}m > ${verification.maxAllowedDistance.toFixed(0)}m)`;
    }
    if (verification.confidenceLevel === 'low') {
      return 'GPS精度が不十分です';
    }
    return '認証条件を満たしていません';
  };

  const getStatusIcon = () => {
    switch (status.phase) {
      case 'locating':
        return <Satellite className="w-5 h-5 animate-pulse text-blue-500" />;
      case 'verifying':
        return <Target className="w-5 h-5 animate-spin text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status.phase) {
      case 'locating':
        return 'bg-blue-50 border-blue-200';
      case 'verifying':
        return 'bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isActive) return null;

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor()}`}>
      {/* ステータスヘッダー */}
      <div className="flex items-center gap-3 mb-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="font-medium text-sm">リアルタイムGPS認証</h3>
          <p className="text-xs text-gray-600">{status.message}</p>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            status.phase === 'completed' ? 'bg-green-500' :
            status.phase === 'failed' ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${status.progress}%` }}
        />
      </div>

      {/* 詳細情報 */}
      {(status.accuracy !== undefined || status.distance !== undefined) && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {status.accuracy !== undefined && (
            <div className="flex items-center gap-1">
              <Satellite className="w-3 h-3" />
              <span>精度: {status.accuracy.toFixed(0)}m</span>
            </div>
          )}
          {status.distance !== undefined && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>距離: {status.distance.toFixed(0)}m</span>
            </div>
          )}
          {status.confidence && (
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>信頼度: {status.confidence}</span>
            </div>
          )}
          {status.spoofingRisk && (
            <div className="flex items-center gap-1">
              <AlertTriangle className={`w-3 h-3 ${
                status.spoofingRisk === 'high' ? 'text-red-500' :
                status.spoofingRisk === 'medium' ? 'text-yellow-500' : 'text-green-500'
              }`} />
              <span>安全性: {status.spoofingRisk}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}