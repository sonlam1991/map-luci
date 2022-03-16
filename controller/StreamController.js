const Stream = require('node-rtsp-stream');
const Utils = require('../libs/utils');
const { v4: uuidv4 } = require('uuid');
const { v4 } = require('uuid');
const dataMapCamera = [];
let currentPort = 1111;

module.exports = {
    async startStream(req, res, next) {
        const streamUrl = req.body.streamUrl;
        console.log(streamUrl);
        console.log(dataMapCamera);
        const checkCamera = dataMapCamera.filter(item => {streamUrl === item.streamUrl});
        console.log({checkCamera});
        if(checkCamera && checkCamera.length > 0) {
            return Utils.response(res, checkCamera);
        }

        currentPort++;
        const stream = new Stream({
            name: v4(),
            // streamUrl: 'rtsp://admin:lumivn274@chuadolelaihpg.cameraddns.net',
            streamUrl: req.body.streamUrl,
            wsPort: currentPort,
            ffmpegOptions: { // options ffmpeg flags
                '-stats': '', // an option with no neccessary value uses a blank string
                '-r': 30 // options with required values specify the value after the key
            }
        });
        const temp = {
            name: v4(),
            streamUrl: req.body.streamUrl,
            stream: stream,
            currentPort: currentPort,
        };
        
        dataMapCamera.push(temp);
        console.log({dataMapCamera});
        return Utils.response(res, temp);
    },

    async stopStream(req, res, next) {
        console.log({dataMapCamera});
        const temp = dataMapCamera.find(item => item.streamUrl === req.body.streamUrl);
        if (temp) {
            temp.stream.stop();
            dataMapCamera.splice(dataMapCamera.indexOf(temp), 1);
        }
        console.log({dataMapCamera});
        return Utils.response(res, req.body);
    },
}