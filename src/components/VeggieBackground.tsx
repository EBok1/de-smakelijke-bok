"use client";

import Image from "next/image";

export default function VeggieBackground() {
  const carrotConfigs = [
    { left: "7%", size: 56, delay: "0s", duration: "10s" },
    { left: "34%", size: 40, delay: "0.3s", duration: "10s" },
    { left: "44%", size: 64, delay: "1.5s", duration: "8s" },
    { left: "62%", size: 48, delay: "0.5s", duration: "10s" },
    { left: "82%", size: 45, delay: "0.2s", duration: "11s" },
  ];

  const tomatoConfigs = [
    { left: "5%", size: 40, delay: "1s", duration: "9s" },
    { left: "20%", size: 64, delay: "0s", duration: "8s" },
    { left: "35%", size: 48, delay: "1.5s", duration: "9s" },
    { left: "52%", size: 40, delay: "0.2s", duration: "7s" },
    { left: "72%", size: 50, delay: "0.6s", duration: "8s" },
    { left: "90%", size: 30, delay: "1s", duration: "8s" },
  ];

  const lettuceConfigs = [
    { left: "2%", size: 30, delay: "0.5s", duration: "9s" },
    { left: "15%", size: 70, delay: "0.8s", duration: "8s" },
    { left: "25%", size: 40, delay: "1s", duration: "9s" },
    { left: "55%", size: 50, delay: "1s", duration: "7s" },
    { left: "77%", size: 40, delay: "1.5s", duration: "8s" },
    { left: "95%", size: 60, delay: "1.2s", duration: "8s" },
  ];

  return (
    <>
      {carrotConfigs.map((c, i) => (
        <Image
          key={i}
          src="/images/carrot.svg"
          alt=""
          width={c.size}
          height={c.size}
          className="veggie-decor animate-veggie-float"
          style={{
            bottom: "0",
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        />
      ))}

      {tomatoConfigs.map((c, i) => (
        <Image
          key={i}
          src="/images/tomato.svg"
          alt=""
          width={c.size}
          height={c.size}
          className="veggie-decor animate-veggie-float"
          style={{
            bottom: "0",
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        />
      ))}

      {lettuceConfigs.map((c, i) => (
        <Image
          key={i}
          src="/images/lettuce.svg"
          alt=""
          width={c.size}
          height={c.size}
          className="veggie-decor animate-veggie-float"
          style={{
            bottom: "0",
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        />
      ))}
    </>
  );
}
