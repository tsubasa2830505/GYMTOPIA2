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
        console.log('generateStoryImage started for post:', post.id);

        // 背景グラデーション
        this.drawBackground();
        console.log('Background drawn');

        // 投稿画像がある場合は背景として使用
        if (post.images && post.images.length > 0) {
            console.log('Drawing post image background:', post.images[0]);
            await this.drawPostImageBackground(post.images[0]);
        }

        // ジムトピアロゴを下部に描画
        console.log('Drawing Gymtopia logo');
        await this.drawGymtopiaLogo();

        // ヘッダー部分（ユーザー情報）- 安全領域内
        console.log('Drawing header');
        await this.drawHeader(post);

        // コンテンツ部分 - 安全領域内
        console.log('Drawing content');
        this.drawContent(post);

        // トレーニング詳細（もしあれば）- 安全領域内
        if (post.training_details?.exercises) {
            console.log('Drawing training details');
            this.drawTrainingDetails(post.training_details);
        }

        // フッター（ジム名、日時）- 安全領域内
        console.log('Drawing footer');
        this.drawFooter(post);

        // 装飾要素
        console.log('Drawing decorations');
        this.drawDecorations();

        const dataUrl = this.canvas.toDataURL('image/png');
        console.log('Image generation completed, data URL length:', dataUrl.length);
        return dataUrl;
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
            console.log('Attempting to load image:', imageUrl);

            // 外部画像URLの場合
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                console.log('External image detected, attempting to load');

                // プロキシ経由で画像を取得（CORS回避）
                try {
                    // 画像を新しいImageオブジェクトで読み込み
                    const img = new Image();
                    img.crossOrigin = 'anonymous';

                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        // プロキシURLを使用（またはそのまま試す）
                        img.src = imageUrl;
                    });

                    // Canvas内に画像を描画
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

                    console.log('External image loaded successfully');
                } catch (error) {
                    console.log('Failed to load external image due to CORS, using enhanced decorative background');
                    // CORS エラーの場合は装飾的な背景を使用
                    this.drawEnhancedDecorativeBackground();
                }

                return;
            }

            // ローカル画像の場合は従来の処理
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
            // 画像読み込み失敗時は装飾的な背景を使用
            this.drawEnhancedDecorativeBackground();
        }
    }

    // 装飾的な背景パターン
    private drawDecorativeBackground() {
        // グラデーションオーバーレイ
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // パターン
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.width, i);
            this.ctx.stroke();
        }
    }

    // 強化された装飾的な背景
    private drawEnhancedDecorativeBackground() {
        // よりダイナミックなグラデーション背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.25, '#764ba2');
        gradient.addColorStop(0.5, '#f093fb');
        gradient.addColorStop(0.75, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 円形パターン
        this.ctx.globalAlpha = 0.1;
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const radius = Math.random() * 300 + 100;

            const circleGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            circleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            circleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = circleGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;

        // フィットネスアイコンを背景に配置
        this.drawFitnessIcons();

        // 半透明のオーバーレイ
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // フィットネスアイコンを描画（シンプルな図形で表現）
    private drawFitnessIcons() {
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;

        // シンプルな幾何学的パターンを描画
        for (let i = 0; i < 6; i++) {
            const x = (i % 3) * 350 + 200;
            const y = Math.floor(i / 3) * 400 + 300;

            // 円形パターン
            this.ctx.beginPath();
            this.ctx.arc(x, y, 40, 0, Math.PI * 2);
            this.ctx.stroke();

            // 内側の円
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    // ジムトピアロゴを描画（画面下部に配置）
    private async drawGymtopiaLogo() {
        const logoY = this.height - 120; // 画面下部に配置（底から120px上）
        const logoX = this.width / 2;

        // ロゴの背景（白背景）
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(0, logoY - 60, this.width, 140);

        try {
            // ロゴ画像を読み込み
            const logoImg = await this.loadImage('/images/gymtopia-logo-black.png');

            // ロゴのサイズと位置を調整
            const logoWidth = 400;
            const logoHeight = 100;
            const logoXPos = (this.width - logoWidth) / 2;
            const logoYPos = logoY - logoHeight / 2;

            // ロゴを描画
            this.ctx.drawImage(logoImg, logoXPos, logoYPos, logoWidth, logoHeight);
        } catch (error) {
            console.log('Logo image not found, using text fallback');

            // フォールバック: テキストでロゴを描画
            this.ctx.save();
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '900 110px "Hiragino Kaku Gothic ProN", "Arial Black", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // 文字の太さを強調するため複数回描画
            for (let i = -2; i <= 2; i += 0.5) {
                for (let j = -2; j <= 2; j += 0.5) {
                    this.ctx.fillText('ジムトピア', logoX + i, logoY + j);
                }
            }

            // メインテキストを最後に描画
            this.ctx.fillText('ジムトピア', logoX, logoY);
            this.ctx.restore();
        }
    }

    // ヘッダー部分（ユーザー情報）- インスタストーリーの安全領域を考慮
    private async drawHeader(post: Post) {
        const headerY = 200; // 上部に配置
        const headerX = 80; // 左寄せの開始位置

        // ユーザー名（左寄せ）
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(post.user?.display_name || 'ユーザー', headerX, headerY);

        // ユーザー名（@username）
        if (post.user?.username) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.fillText(`@${post.user.username}`, headerX, headerY + 55);
        }

        // 投稿日時
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const dateText = this.formatDate(post.created_at);
        this.ctx.fillText(dateText, headerX, headerY + 100);
    }

    // デフォルトアバター
    private drawDefaultAvatar(x: number, y: number) {
        this.ctx.save();

        // グラデーション背景の円
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 40);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 40, 0, Math.PI * 2);
        this.ctx.fill();

        // ユーザーアイコン（シンプルな人型シルエット）
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        // 頭
        this.ctx.arc(x, y - 10, 12, 0, Math.PI * 2);
        this.ctx.fill();
        // 体
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 15, 18, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    // コンテンツ部分 - 安全領域内に配置
    private drawContent(post: Post) {
        const contentY = 340; // ヘッダーの下に配置
        const contentWidth = this.width - 140; // 左右60px + 右余白80px

        if (post.content) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.textAlign = 'left';

            // テキストを複数行に分割
            const lines = this.wrapText(post.content, contentWidth, this.ctx);
            lines.forEach((line, index) => {
                this.ctx.fillText(line, 70, contentY + (index * 55));
            });
        }
    }

    // トレーニング詳細 - 安全領域内に配置
    private drawTrainingDetails(trainingDetails: any) {
        const startY = 620; // コンテンツの下に配置（文字サイズ増加に対応）
        let currentY = startY;

        // エクササイズ一覧の内容を先に確認
        if (!trainingDetails.exercises || trainingDetails.exercises.length === 0) {
            return; // エクササイズがない場合は何も描画しない
        }

        // 実際に描画するエクササイズ数（最大3つ）
        const exercisesToShow = trainingDetails.exercises.slice(0, 3);
        const exerciseCount = exercisesToShow.length;

        // 背景の高さを正確に計算（フォントサイズ増加に対応）
        // タイトル行: 50px
        // 各エクササイズ: 80px (名前行40px + 詳細行40px)
        // 上下パディング: 各20px
        const backgroundHeight = 20 + 50 + (exerciseCount * 80) + 20;

        // トレーニング詳細の背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.fillRect(60, currentY - 20, this.width - 120, backgroundHeight);

        // タイトル
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillText('トレーニング詳細', 80, currentY + 25);

        currentY += 70; // タイトル後の間隔

        // エクササイズ一覧
        exercisesToShow.forEach((exercise: any, index: number) => {
            // エクササイズ名（文字数制限）
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const exerciseName = exercise.name.length > 12 ? exercise.name.substring(0, 11) + '...' : exercise.name;
            const exerciseText = `${index + 1}. ${exerciseName}`;
            this.ctx.fillText(exerciseText, 80, currentY);

            // 重量・セット・回数
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const detailsText = `${exercise.weight}kg × ${exercise.sets}セット × ${exercise.reps}回`;
            this.ctx.fillText(detailsText, 100, currentY + 38);

            currentY += 80; // 次のエクササイズまでの間隔
        });
    }

    // フッター - 下部の安全領域を考慮
    private drawFooter(post: Post) {
        const footerY = this.height - 260; // ロゴの上に配置するため調整

        // ジム名
        if (post.gym?.name) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(post.gym.name, this.width / 2, footerY);
        }

        // いいね・コメント数（シンプルなデザイン）
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.textAlign = 'center';

        // シンプルなテキスト表示
        const statsText = `いいね ${post.likes_count}  |  コメント ${post.comments_count}`;
        this.ctx.fillText(statsText, this.width / 2, footerY + 40);
    }

    // 装飾要素 - 安全領域を考慮
    private drawDecorations() {
        // 上部の装飾ラインは削除（投稿内容と被るため）

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

    // テキストを複数行に分割（日本語対応）
    private wrapText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D): string[] {
        const lines: string[] = [];
        let currentLine = '';

        // 日本語の場合は文字単位で分割
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        // 最大5行までに制限
        if (lines.length > 5) {
            const truncated = lines.slice(0, 4);
            truncated.push(lines[4].substring(0, lines[4].length - 3) + '...');
            return truncated;
        }

        return lines;
    }

    // 日時フォーマット
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');

        // 実施日として表示（例: 2024年1月15日 14:30）
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
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

    // 画像をダウンロード（Promise版）
    downloadImage(filename: string = 'gymtopia-story.png'): Promise<void> {
        console.log('downloadImage called with filename:', filename);

        return new Promise((resolve, reject) => {
            // Canvas から Blob を作成
            this.canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob from canvas');
                    reject(new Error('Failed to create blob from canvas'));
                    return;
                }

                console.log('Blob created, size:', blob.size);

                // Blob URL を作成
                const url = URL.createObjectURL(blob);

                // ダウンロードリンクを作成
                const link = document.createElement('a');
                link.download = filename;
                link.href = url;
                link.style.display = 'none';

                // リンクを body に追加してクリック
                document.body.appendChild(link);
                link.click();

                // クリーンアップ
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    console.log('Download cleanup completed');
                    resolve();
                }, 100);

                console.log('Download initiated');
            }, 'image/png');
        });
    }
}

// 便利な関数
export async function generateStoryImage(post: Post): Promise<string> {
    const generator = new StoryImageGenerator();
    return await generator.generateStoryImage(post);
}

export async function downloadStoryImage(post: Post, filename?: string): Promise<void> {
    console.log('downloadStoryImage called for post:', post.id);
    const generator = new StoryImageGenerator();
    await generator.generateStoryImage(post);
    await generator.downloadImage(filename);
    console.log('downloadStoryImage completed');
}
