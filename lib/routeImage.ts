import type { DistanceRunResult, RunRoutePoint } from '../types';
import { formatDistance, formatDuration, formatPace } from './distanceQuest';

const projectRoute = (points: RunRoutePoint[], width: number, height: number, padding: number) => {
  const minLat = Math.min(...points.map(p => p.latitude));
  const maxLat = Math.max(...points.map(p => p.latitude));
  const minLon = Math.min(...points.map(p => p.longitude));
  const maxLon = Math.max(...points.map(p => p.longitude));
  const latRange = Math.max(0.00001, maxLat - minLat);
  const lonRange = Math.max(0.00001, maxLon - minLon);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const scale = Math.min(usableWidth / lonRange, usableHeight / latRange);
  const routeWidth = lonRange * scale;
  const routeHeight = latRange * scale;
  const offsetX = padding + (usableWidth - routeWidth) / 2;
  const offsetY = padding + (usableHeight - routeHeight) / 2;

  return points.map(point => ({
    x: offsetX + (point.longitude - minLon) * scale,
    y: offsetY + (maxLat - point.latitude) * scale,
  }));
};

export const createRouteImage = (points: RunRoutePoint[], result: DistanceRunResult, title: string): string | null => {
  if (points.length < 2) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(14, 165, 233, 0.28)');
  gradient.addColorStop(0.55, 'rgba(2, 6, 23, 0)');
  gradient.addColorStop(1, 'rgba(34, 211, 238, 0.16)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.lineWidth = 2;
  for (let x = 80; x < canvas.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 250);
    ctx.lineTo(x, 1020);
    ctx.stroke();
  }
  for (let y = 260; y < 1020; y += 80) {
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(1010, y);
    ctx.stroke();
  }

  const projected = projectRoute(points, canvas.width, 760, 90).map(p => ({ x: p.x, y: p.y + 250 }));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 26;
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 18;
  ctx.beginPath();
  projected.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;

  const start = projected[0];
  const end = projected[projected.length - 1];
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(start.x, start.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(end.x, end.y, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#bfdbfe';
  ctx.font = '900 34px Arial';
  ctx.fillText('R.L.L LITE DISTANCE QUEST', 70, 100);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px Arial';
  ctx.fillText(title.toUpperCase().slice(0, 28), 70, 170);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 120px Arial';
  ctx.fillText(`[${result.finalGrade}]`, 70, 1210);

  const stats = [
    ['DISTANCE', formatDistance(result.distanceMeters)],
    ['TIME', formatDuration(result.durationSeconds)],
    ['PACE', formatPace(result.paceSecondsPerKm)],
  ];
  ctx.textAlign = 'right';
  stats.forEach((stat, index) => {
    const y = 1110 + index * 58;
    ctx.fillStyle = '#64748b';
    ctx.font = '900 24px Arial';
    ctx.fillText(stat[0], 1010, y);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px Arial';
    ctx.fillText(stat[1], 1010, y + 36);
  });
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
};

export const downloadRouteImage = async (dataUrl: string, fileName: string) => {
  const isNative = (window as any).Capacitor?.isNativePlatform?.();
  if (isNative) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import('@capacitor/filesystem'),
      import('@capacitor/share'),
    ]);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });
    const fileUri = await Filesystem.getUri({
      path: fileName,
      directory: Directory.Cache,
    });
    await Share.share({
      title: 'Run Route',
      text: 'R.L.L Lite distance quest route',
      url: fileUri.uri,
      dialogTitle: 'Save route image',
    });
    return;
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};
