import React from 'react'
import style from './loading.module.css'

export default function Loading({ status }) {
  return (
      <div className={(status)? 'block':'none'}>
        <div className={style.main}>
            <div className={style.loading}><div></div><div></div><div></div></div>
        </div>
      </div>
  )
}
