const Jimp = require('jimp');

async function compress(buffer) {
    return await Jimp.read(buffer,  { maxMemoryUsageInMB: 20024 })
        .then(async image => {
            image
                .quality(20)
            // .blur(100) // set Image quality
            // .write('new_name_blur.jpg');
            return image.getBufferAsync(Jimp.AUTO);
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = { compress };