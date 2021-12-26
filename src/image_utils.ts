import * as Jimp from 'jimp';

export function scaleImage(destinationImagePath: string, imagePath: string, scale: number) {
    return new Promise<void>((resolve, reject) => {
        Jimp.read(imagePath, (error, image) => {
            if (error) {
                reject(error);
                console.log(error);
                throw error;
            }
            image.scale(scale).write(destinationImagePath);
            resolve();
        });
    });
};