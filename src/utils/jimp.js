const Jimp = require('jimp');

async function compress(buffer) {
    return await Jimp.read(buffer)
        .then(async image => {
            image
                .quality(20)
                .write('new_name_compress.jpg')
            // .blur(100) // set Image quality
            // .write('new_name_blur.jpg');
            return image.getBufferAsync(Jimp.AUTO);
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = { compress };