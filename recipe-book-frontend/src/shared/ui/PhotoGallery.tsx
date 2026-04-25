import { useState } from 'react';

type PhotoGalleryProps = {
    urls: string[];
};

export function PhotoGallery({ urls }: PhotoGalleryProps) {
    const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());

    if (urls.length === 0) {
        return <div className="photo-placeholder">Нет фото</div>;
    }

    const markAsFailed = (url: string) => {
        setFailedUrls((current) => new Set(current).add(url));
    };

    return (
        <div className="photo-gallery">
            {urls.map((url, index) => failedUrls.has(url) ? (
                <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="photo-fallback">
                    <span>Не удалось показать фото {index + 1}</span>
                    <small>Открыть ссылку</small>
                </a>
            ) : (
                <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="photo-image-link">
                    <img src={url} alt={`Фото ${index + 1}`} className="photo-image" onError={() => markAsFailed(url)} />
                </a>
            ))}
        </div>
    );
}