import React from 'react';
import Head from 'next/head'
import { useState, useEffect, useRef } from 'react';
import zoompng from '../assets/zoom.png'
import Image from 'next/image';
import Loading from '../components/loading/loading';
import { useRouter } from 'next/router';


function App() {

  const router = useRouter()
  const [ZoomMtg, setZoomMtg] = useState(null)
  const [loading, setloading] = useState(true)
  const [input, setinput] = useState({
    meetingNumber: null,
    userName: null,
    userEmail: null,
    passWord: null
  })
  const meetid = useRef(null)

  var signatureEndpoint = '/api/signature'
  var sdkKey = process.env.SDK_KEY
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
      router.push({
        pathname: '/meeting',
        query: { 
          signature: response.signature,
          meeting_number: meetingNumber,
          password: passWord,
          username: userName,
          email: userEmail,
        },
      })
    }).catch(error => {
      console.error(error)
    })
  }

  function handleChange(e){
    const name = e.target.name;
    const value = e.target.value;
    setinput({ ...input, ...{ [name]: value }})
  }

  function meetNum(e){
    const name = e.target.name;
    const value = e.target.value;
    const s = value.search(/\s/g)
    if(s >= 0){
      return meetid.current.style.display = "block"
    }
    meetid.current.style.display = "none"
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

      {/* <Loading status={loading} /> */}
      <div className='container'>
        <div className='card'>
          <div className='logo'>
            <Image sizes={120} src={zoompng} alt='' />
          </div>
          <div className="form">
            <input placeholder="username" id='userName' className="form__input" name='userName' onChange={handleChange} autoComplete="true" />
            <label className="form__label" htmlFor='userName'>username</label>
          </div>
          <div className="form">
            <input placeholder="email" id='userEmail' className="form__input" name='userEmail' onChange={handleChange} autoComplete="true" />
            <label className="form__label" htmlFor='userEmail'>email</label>
          </div>
          <div className="form">
            <input placeholder="meeting Id" id='meetingNumber' className="form__input" name='meetingNumber' onChange={meetNum} autoComplete="true" />
            <label className="form__label" htmlFor='meetingNumber'>meeting Id</label>
            <p ref={meetid} id="meetingNumber" className='error_message'>tidak boleh ada spasi</p>
          </div>
          <div className="form">
            <input placeholder="password" id='passWord' className="form__input" name='passWord' onChange={handleChange} autoComplete="true" />
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
