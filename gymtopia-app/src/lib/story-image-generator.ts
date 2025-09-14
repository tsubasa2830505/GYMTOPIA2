import { Post } from './supabase/posts';

// インスタグラムストーリー用の画像生成クラス
export class StoryImageGenerator {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private readonly width = 1080; // インスタストーリーの推奨サイズ
    private readonly height = 1920;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d')!;
    }

    // メインの画像生成メソッド
    async generateStoryImage(post: Post): Promise<string> {
        // 背景グラデーション
        this.drawBackground();

        // 投稿画像がある場合は背景として使用
        if (post.images && post.images.length > 0) {
            await this.drawPostImageBackground(post.images[0]);
        }

        // ヘッダー部分（ユーザー情報）- 安全領域内
        await this.drawHeader(post);

        // コンテンツ部分 - 安全領域内
        this.drawContent(post);

        // トレーニング詳細（もしあれば）- 安全領域内
        if (post.training_details?.exercises) {
            this.drawTrainingDetails(post.training_details);
        }

        // フッター（ジム名、日時）- 安全領域内
        this.drawFooter(post);

        // 装飾要素
        this.drawDecorations();

        return this.canvas.toDataURL('image/png');
    }

    // 背景グラデーション
    private drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // 投稿画像を背景として描画
    private async drawPostImageBackground(imageUrl: string) {
        try {
            const img = await this.loadImage(imageUrl);

            // 画像をキャンバス全体にフィットさせる（アスペクト比を保持）
            const imgAspect = img.width / img.height;
            const canvasAspect = this.width / this.height;

            let drawWidth, drawHeight, drawX, drawY;

            if (imgAspect > canvasAspect) {
                // 画像の方が横長
                drawHeight = this.height;
                drawWidth = drawHeight * imgAspect;
                drawX = (this.width - drawWidth) / 2;
                drawY = 0;
            } else {
                // 画像の方が縦長
                drawWidth = this.width;
                drawHeight = drawWidth / imgAspect;
                drawX = 0;
                drawY = (this.height - drawHeight) / 2;
            }

            // 画像を描画
            this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

            // 半透明のオーバーレイを追加（テキストの可読性向上）
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.fillRect(0, 0, this.width, this.height);

        } catch (error) {
            console.error('Error loading post image:', error);
            // 画像読み込み失敗時はグラデーション背景のまま
        }
    }

    // ヘッダー部分（ユーザー情報）- インスタストーリーの安全領域を考慮
    private async drawHeader(post: Post) {
        const headerY = 200; // 上部の安全領域を確保（ユーザー名表示エリアを避ける）

        // ユーザーアバター
        if (post.user?.avatar_url) {
            try {
                const avatar = await this.loadImage(post.user.avatar_url);
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(80, headerY, 40, 0, Math.PI * 2);
                this.ctx.clip();
                this.ctx.drawImage(avatar, 40, headerY - 40, 80, 80);
                this.ctx.restore();
            } catch (error) {
                // アバター読み込み失敗時はデフォルトアイコン
                this.drawDefaultAvatar(80, headerY);
            }
        } else {
            this.drawDefaultAvatar(80, headerY);
        }

        // ユーザー名
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillText(post.user?.display_name || 'ユーザー', 150, headerY + 15);

        // ユーザー名（@username）
        if (post.user?.username) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.fillText(`@${post.user.username}`, 150, headerY + 50);
        }

        // 投稿日時
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const dateText = this.formatDate(post.created_at);
        this.ctx.fillText(dateText, 150, headerY + 80);
    }

    // デフォルトアバター
    private drawDefaultAvatar(x: number, y: number) {
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 40, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💪', x, y + 10);
        this.ctx.restore();
    }

    // コンテンツ部分 - 安全領域内に配置
    private drawContent(post: Post) {
        const contentY = 350; // ヘッダーとの間隔を調整
        const contentWidth = this.width - 120;

        if (post.content) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.textAlign = 'left';

            // テキストを複数行に分割
            const lines = this.wrapText(post.content, contentWidth, this.ctx);
            lines.forEach((line, index) => {
                this.ctx.fillText(line, 60, contentY + (index * 50));
            });
        }
    }

    // トレーニング詳細 - 安全領域内に配置
    private drawTrainingDetails(trainingDetails: any) {
        const startY = 600; // コンテンツとの間隔を調整
        let currentY = startY;

        // トレーニング詳細の背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.fillRect(60, currentY - 20, this.width - 120, 200);

        // タイトル
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillText('🏋️ トレーニング詳細', 80, currentY + 20);

        currentY += 60;

        // エクササイズ一覧
        if (trainingDetails.exercises && trainingDetails.exercises.length > 0) {
            trainingDetails.exercises.slice(0, 3).forEach((exercise: any, index: number) => {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

                const exerciseText = `${index + 1}. ${exercise.name}`;
                this.ctx.fillText(exerciseText, 80, currentY);

                // 重量・セット・回数
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                const detailsText = `${exercise.weight}kg × ${exercise.sets}セット × ${exercise.reps}回`;
                this.ctx.fillText(detailsText, 100, currentY + 30);

                currentY += 70;
            });
        }
    }

    // フッター - 下部の安全領域を考慮
    private drawFooter(post: Post) {
        const footerY = this.height - 250; // 下部の安全領域を確保（メッセージ送信エリアを避ける）

        // ジム名
        if (post.gym?.name) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`📍 ${post.gym.name}`, this.width / 2, footerY);
        }

        // いいね・コメント数
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillText(`❤️ ${post.likes_count} 💬 ${post.comments_count}`, this.width / 2, footerY + 40);

        // アプリ名
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillText('ジムトピア', this.width / 2, footerY + 80);
    }

    // 装飾要素 - 安全領域を考慮
    private drawDecorations() {
        // 上部の装飾ライン（安全領域内）
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(60, 300);
        this.ctx.lineTo(this.width - 60, 300);
        this.ctx.stroke();

        // 下部の装飾ライン（安全領域内）
        this.ctx.beginPath();
        this.ctx.moveTo(60, this.height - 300);
        this.ctx.lineTo(this.width - 60, this.height - 300);
        this.ctx.stroke();

        // コーナーの装飾
        this.drawCornerDecorations();
    }

    // コーナー装飾
    private drawCornerDecorations() {
        const cornerSize = 60;

        // 左上
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(30, 30);
        this.ctx.lineTo(30, 30 + cornerSize);
        this.ctx.moveTo(30, 30);
        this.ctx.lineTo(30 + cornerSize, 30);
        this.ctx.stroke();

        // 右上
        this.ctx.beginPath();
        this.ctx.moveTo(this.width - 30, 30);
        this.ctx.lineTo(this.width - 30, 30 + cornerSize);
        this.ctx.moveTo(this.width - 30, 30);
        this.ctx.lineTo(this.width - 30 - cornerSize, 30);
        this.ctx.stroke();

        // 左下
        this.ctx.beginPath();
        this.ctx.moveTo(30, this.height - 30);
        this.ctx.lineTo(30, this.height - 30 - cornerSize);
        this.ctx.moveTo(30, this.height - 30);
        this.ctx.lineTo(30 + cornerSize, this.height - 30);
        this.ctx.stroke();

        // 右下
        this.ctx.beginPath();
        this.ctx.moveTo(this.width - 30, this.height - 30);
        this.ctx.lineTo(this.width - 30, this.height - 30 - cornerSize);
        this.ctx.moveTo(this.width - 30, this.height - 30);
        this.ctx.lineTo(this.width - 30 - cornerSize, this.height - 30);
        this.ctx.stroke();
    }

    // テキストを複数行に分割
    private wrapText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    // 日時フォーマット
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes}分前`;
        } else if (hours < 24) {
            return `${hours}時間前`;
        } else if (days < 7) {
            return `${days}日前`;
        } else {
            return date.toLocaleDateString('ja-JP');
        }
    }

    // 画像読み込み
    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // 画像をダウンロード
    downloadImage(filename: string = 'gymtopia-story.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// 便利な関数
export async function generateStoryImage(post: Post): Promise<string> {
    const generator = new StoryImageGenerator();
    return await generator.generateStoryImage(post);
}

export function downloadStoryImage(post: Post, filename?: string): Promise<void> {
    return new Promise(async (resolve) => {
        const generator = new StoryImageGenerator();
        await generator.generateStoryImage(post);
        generator.downloadImage(filename);
        resolve();
    });
}
