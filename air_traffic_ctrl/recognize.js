/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This application demonstrates how to perform basic recognize operations with
 * with the Google Cloud Speech API.
 *
 * For more information, see the README.md under /speech and the documentation
 * at https://cloud.google.com/speech/docs.
 */

'use strict';

function analyzeText(text) {
  // [START language_entities_string]
  // Imports the Google Cloud client library
  const Language = require('@google-cloud/language');

  // Instantiates a client
  const language = Language();

  // TTS
  var say = require('say');

  var speech = 'Station calling Kennedy, say again';


  // Return string
  var pilotInfo = {};
  pilotInfo["flightNum"] = "";
  pilotInfo["gateNum"] = "23";
  pilotInfo["gateDir"] = "Right";
  //associativeArray["one"] = "First";

  // The text to analyze, e.g. "Hello, world!"
  // const text = 'Hello, world!';

  // Instantiates a Document, representing the provided text
  const document = {
    'content': text,
    type: 'PLAIN_TEXT'
  };

  function setSpeechToTakeOffClearance(directionOfFlight) {
      speech = ["November " + pilotInfo["flightNum"] + ", " + directionOfFlight + ' departure approved. ' + "Wind " + Math.floor(Math.random() * 360) + " at " + Math.floor(Math.random() * 15) +
          " runway " + "4 left" + " cleared for takeoff"];
  }

  language.analyzeSyntax({
      document: document
    })
    .then((results) => {
      const syntax = results[0];

      // console.log('Tokens:');
      syntax.tokens.forEach((part) => {
        // console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        // console.log(`Morphology:`, part.partOfSpeech);
        if (part.partOfSpeech.tag === "NUM") {
          pilotInfo["fligtNum"] = part.text.content.split('').join(' ');

        }
        else if (part.text.content.toUpperCase() === 'NORTH' || part.text.content.toUpperCase() === 'SOUTH' || part.text.content.toUpperCase() === 'EAST' || part.text.content.toUpperCase() === 'WEST') {
            setSpeechToTakeOffClearance(part.text.content);
          // setTimeout(function() {say.speak(speech[Math.floor(Math.random()*speech.length)] );}, 1000);
          // setTimeout(function() {console.log(speech);
          // }, 500);
        }
        else if (part.text.content.toUpperCase() ==="LEFT" || part.text.content.toUpperCase() ==="RIGHT"){
          pilotInfo["gateDir"] = part.text.content;
        }
        else if(part.text.content.toUpperCase() ==="TAXI"){
          speech = "November " + pilotInfo["flightNum"] + " runway 1 3 right Left, taxi via Quebec Alpha Kilo. Cross runway 1 3 Left.";
          // setTimeout(function() {say.speak(speech);}, 1000);
          // setTimeout(function() {console.log(speech);
          // }, 500);
        }
        // else if (part.text.content === 'departure') {
        //   var speech = 'November' + pilotInfo["fligtNum"] + ', runway 3 1 Left at Kilo-Alpha, taxi via Quebec Alpha Kilo-Alpha';
        // }
        else {
            setSpeechToTakeOffClearance("on course");
        }
      });
    }).then((results) => {
      say.speak(speech);
      console.log(speech);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });


}


// // Detects syntax in the document
// language.analyzeSyntax({ document: document })
//   .then((results) => {
//     const syntax = results[0];
//
//     console.log('Tokens:');
//     syntax.tokens.forEach((part) => {
//       console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
//       console.log(`Morphology:`, part.partOfSpeech);
//     });
//   })
//   .catch((err) => {
//     console.error('ERROR:', err);
//   });
// // [END language_syntax_string]


function streamingMicRecognize(encoding, sampleRateHertz, languageCode) {

  // [START speech_streaming_mic_recognize]
  const record = require('node-record-lpcm16');

  // Imports the Google Cloud client library
  const Speech = require('@google-cloud/speech');

  // Instantiates a client
  const speech = Speech();



  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode
    },
    interimResults: false // If you want interim results, set this to true
  };

  const recognizeStream = speech.streamingRecognize(request)
    .on('error', console.error)
    .on('data', (data) =>
      analyzeText(data.results[0].alternatives[0].transcript));

  //President Obama is speaking at the White House.
  // process.stdout.write(
  //   (data.results[0] && data.results[0].alternatives[0])
  //     ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
  //     : `\n\nReached transcription time limit, press Ctrl+C\n`));

  // Start recording and send the microphone input to the Speech API
  record
    .start({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '10.0'
    })
    .on('error', console.error)
    .pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');

  // [END speech_streaming_mic_recognize]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `sync <filename>`,
    `Detects speech in a local audio file.`, {},
    (opts) => syncRecognize(opts.filename, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `sync-gcs <gcsUri>`,
    `Detects speech in an audio file located in a Google Cloud Storage bucket.`, {},
    (opts) => syncRecognizeGCS(opts.gcsUri, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `sync-words <filename>`,
    `Detects speech in a local audio file with word time offset.`, {},
    (opts) => syncRecognizeWords(opts.filename, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `async <filename>`,
    `Creates a job to detect speech in a local audio file, and waits for the job to complete.`, {},
    (opts) => asyncRecognize(opts.filename, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `async-gcs <gcsUri>`,
    `Creates a job to detect speech in an audio file located in a Google Cloud Storage bucket, and waits for the job to complete.`, {},
    (opts) => asyncRecognizeGCS(opts.gcsUri, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `async-gcs-words <gcsUri>`,
    `Creates a job to detect speech  with word time offset in an audio file located in a Google Cloud Storage bucket, and waits for the job to complete.`, {},
    (opts) => asyncRecognizeGCSWords(opts.gcsUri, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `stream <filename>`,
    `Detects speech in a local audio file by streaming it to the Speech API.`, {},
    (opts) => streamingRecognize(opts.filename, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `listen`,
    `Detects speech in a microphone input stream. This command requires that you have SoX installed and available in your $PATH. See https://www.npmjs.com/package/node-record-lpcm16#dependencies`, {},
    (opts) => streamingMicRecognize(opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .options({
    encoding: {
      alias: 'e',
      default: 'LINEAR16',
      global: true,
      requiresArg: true,
      type: 'string'
    },
    sampleRateHertz: {
      alias: 'r',
      default: 16000,
      global: true,
      requiresArg: true,
      type: 'number'
    },
    languageCode: {
      alias: 'l',
      default: 'en-US',
      global: true,
      requiresArg: true,
      type: 'string'
    }
  })
  .example(`node $0 sync ./resources/audio.raw -e LINEAR16 -r 16000`)
  .example(`node $0 async-gcs gs://gcs-test-data/vr.flac -e FLAC -r 16000`)
  .example(`node $0 stream ./resources/audio.raw  -e LINEAR16 -r 16000`)
  .example(`node $0 listen`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/speech/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
