import Image from 'next/image'
import React from 'react'
interface LogoProps{

    width:number;
    height:number;
}
const Logo = ({width,height}:LogoProps) => {
  return (
    <Image
    src={"/logo.png"}
    alt='Logo'
    width={width}
    height={height}
     />
        

  )
}

export default Logo