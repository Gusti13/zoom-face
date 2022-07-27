import React from 'react';
import Head from 'next/head'
import { useState, useEffect } from 'react';
import Loading from '../components/loading/loading';
import { useRouter } from 'next/router';


function Meeting({ sdkKey }) {

  const route = useRouter();
  const { 
    signature, 
    meeting_number,
    password,
    username,
    email,
  } = route.query;
  const [loading, setloading] = useState(true)
  const leaveUrl = "https://zoom-face.vercel.app"

  function startMeeting(ZoomMtg) {
    try {
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
          setloading(false)

          ZoomMtg.join({
            signature: signature,
            meetingNumber: meeting_number,
            userName: username,
            sdkKey: sdkKey,
            userEmail: email,
            passWord: password,
            success: (success) => {
              console.log(success)
            },
            error: (error) => {
              console.log(error)
            }
          })

        },
        error: (error) => {
          console.log(error)
          setloading(false)
        }
      })
    } catch (error) {
      main()
    }
  }

  function detect(video) {
    let width;
    let height;
    let displaySize;
    let videoStream;

    // create loading
    if(video){
      const el = document.createElement("div")
      const text = document.createTextNode("Loading FaceApi...")
      el.appendChild(text)
      video.after(el)
      el.style.position = "absolute"
      el.style.top = "10px"
      el.style.right = "10px"
      el.style.padding = "10px"
      el.style.background = "blue"
      el.style.color = "white"
      el.setAttribute("id", "loading")
    }

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
        try {
            if(video){
                const detections = await faceapi.detectAllFaces(videoStream)
                                                .withFaceExpressions()
                                                .withAgeAndGender();
                // console.log(detections)
                if(detections){
                  let loading = document.getElementById("loading")
                  loading.remove()
                }
      
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
        } catch (error) {
            console.log(error.message)
            detect()
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
    }).catch(err=>detect())
  }

  async function main(){
    try {
      const x = await import('@zoomus/websdk')
      startMeeting(x.ZoomMtg)
    } catch (error) {
      main()
    }
  }


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

  
  useEffect(() => {
    main()
  }, [route])
  

  return (
    <>
      <Head>
        <title>meeting app</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="origin-trial" content=""></meta>
      </Head>

      <Loading status={loading} />
      <div>
        <video id="videoStream" playsInline autoPlay muted></video>
        <div className='loading-faceapi'>
          <h5>Loading FaceApi...</h5>
        </div>
      </div>
    </>
  );
}

export default Meeting;

export async function getStaticProps(context) {
    return {
      props: {
          sdkKey: process.env.SDK_KEY
      }, // will be passed to the page component as props
    }
}
