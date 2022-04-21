import React from 'react';
import Head from 'next/head'
import { useState, useEffect } from 'react';
import zoompng from '../assets/zoom.png'
import Image from 'next/image';
import Loading from '../components/loading/loading';


function App() {

  const [ZoomMtg, setZoomMtg] = useState(null)
  const [loading, setloading] = useState(true)
  const [input, setinput] = useState({
    meetingNumber: null,
    userName: null,
    userEmail: null,
    passWord: null
  })

  var signatureEndpoint = '/api/signature'
  var sdkKey = "rqrOGbaDQpRKXO8s4DQMEhBQi0gOOXTO1cv1"
  var meetingNumber = input.meetingNumber
  var role = 0
  var leaveUrl = "http://localhost:3000"
  var userName = input.userName
  var userEmail = input.userEmail
  var passWord = input.passWord
  var registrantToken = ''

  function getSignature(e) {
    e.preventDefault();

    fetch(signatureEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingNumber: meetingNumber,
        role: role
      })
    }).then(res => res.json())
    .then(response => {
      startMeeting(response.signature)
      console.log(response.signature)
    }).catch(error => {
      console.error(error)
    })
  }

  function startMeeting(signature) {
    document.getElementById('zmmtg-root').style.display = 'block'

    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.3.5/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();
    ZoomMtg.i18n.load('en-US');
    ZoomMtg.i18n.reload('en-US');

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      success: (success) => {
        console.log(success)

        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          sdkKey: sdkKey,
          userEmail: userEmail,
          passWord: passWord,
          success: (success) => {
            console.log(success)
            console.log('root', document.querySelector('#main-video'))
          },
          error: (error) => {
            console.log(error)
          }
        })

      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  function detect(video) {
    let width;
    let height;
    let displaySize;
    let videoStream;

    // menampilkan video meet ke dalam tag video
    if(video){
      videoStream = document.querySelector("#videoStream")
      const stream = video.captureStream();
      videoStream.srcObject = stream;
    }
    
    // membuat canvas baru di depan video meet untuk menampilkan kotak hasil deteksi.
    if(video){
      width = video.offsetWidth
      height = video.offsetHeight
      displaySize = { width, height }

      const canvas = document.createElement("canvas")
      video.after(canvas)
      canvas.style.position = "absolute";
      canvas.style.top = 0;
      canvas.style.left = 0;
      canvas.setAttribute("width", `${width}`)
      canvas.setAttribute("height", `${height}`)
      var ctxDetect = canvas.getContext('2d');
    }

    // import face api dan melakukan proses deteksi wajah
    import('face-api.js').then(faceapi => {

      async function main() {
        if(video){
          const detections = await faceapi.detectAllFaces(videoStream)
                                          .withFaceExpressions()
                                          .withAgeAndGender();
          // console.log(detections)

          ctxDetect.clearRect(0,0, width, height);
          const resizedDetections = faceapi.resizeResults(detections, displaySize)
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
          resizedDetections.forEach(result => {
            const {age, gender, genderProbability} = result;
            new faceapi.draw.DrawTextField ([
                `${Math.round(age,0)} Tahun`,
                `${gender} ${Math.round(genderProbability)}`
            ],
            result.detection.box.bottomRight
            ).draw(canvas);
          });
        }
      }

      Promise.all([
        faceapi.nets.ageGenderNet.loadFromUri('models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('models'),
        faceapi.nets.faceExpressionNet.loadFromUri('models')
      ]).then(setInterval(main, 1000));
    })
  }


  // menginport zoom sdk dan memasukannya ke dalam state ZoomMtg
  useEffect(() => {
    async function t(){
      const x = await import('@zoomus/websdk')
      setZoomMtg(x.ZoomMtg)
      setloading(false)
    }
    t()
  }, [])


  // mengambil id canvas jika video sudah muncul
  useEffect(() => {
    let inter = setInterval(() => {
      const el = document.querySelector("#speak-view-video")
      if(el){
        console.log("create element")
        detect(el)
        clearInterval(inter)
      }
    }, 5000);
  }, [])

  function handleChange(e){
    const name = e.target.name;
    const value = e.target.value;
    setinput({ ...input, ...{ [name]: value }})
  }
  

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="origin-trial" content=""></meta>
      </Head>

      <Loading status={loading} />
      <div className='container'>
        <div className='card'>
          <div className='logo'>
            <Image sizes={120} src={zoompng} alt='' />
          </div>
          <div className="form">
            <input placeholder="username" id='userName' className="form__input" name='userName' onChange={handleChange} autoComplete />
            <label className="form__label" htmlFor='userName'>username</label>
          </div>
          <div className="form">
            <input placeholder="email" id='userEmail' className="form__input" name='userEmail' onChange={handleChange} autoComplete />
            <label className="form__label" htmlFor='userEmail'>email</label>
          </div>
          <div className="form">
            <input placeholder="meeting Id" id='meetingNumber' className="form__input" name='meetingNumber' onChange={handleChange} autoComplete />
            <label className="form__label" htmlFor='meetingNumber'>meeting Id</label>
          </div>
          <div className="form">
            <input placeholder="password" id='passWord' className="form__input" name='passWord' onChange={handleChange} autoComplete />
            <label className="form__label" htmlFor='passWord'>password</label>
          </div>
          <div className='flex-center'>
            <button onClick={getSignature} className='btn__join'>Join Meeting</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
