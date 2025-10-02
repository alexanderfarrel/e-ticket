"use client";
import Image from "next/image";
import Counter from "./counter";
import { useEffect, useState } from "react";
import { toIdr } from "../../utils/toIdr";
import { EventInterface } from "../../interfaces/event";
import useSWR from "swr";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Content({
  detailEvent,
  slug,
}: {
  detailEvent: EventInterface;
  slug: string | null;
}) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(1);
  const [isNameErr, setIsNameErr] = useState<boolean>(false);
  const [isEmailInfoOpen, setIsEmailInfoOpen] = useState<boolean>(false);
  useEffect(() => {
    const snapScript = "https://app.midtrans.com/snap/snap.js";
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey!);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const {
    data: event,
    error,
    mutate,
  } = useSWR<EventInterface>(`/api/event?id=${slug}`, fetcher, {
    fallbackData: detailEvent,
  });

  if (error) {
    return (
      <p className="text-red-500 text-center mt-5">Failed to fetch event</p>
    );
  }

  const handleCheckoutInvalid = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Mohon isi nama dan email");
      return;
    }

    return toast.info("Maaf Saat ini pembayaran belum tersedia ");
  };

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Mohon isi nama dan email");
      return;
    }
    setIsEmailInfoOpen(false);
    setIsLoading(true);
    try {
      const newId = `${slug}-${Date.now() + Math.random()}`;
      const data = {
        id: newId,
        productName: event?.title,
        price: event?.price,
        quantity: count,
        email,
        name,
      };

      const res = await fetch("/api/tokenizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const reqData = await res.json();
      if (reqData.message === "Invalid username") {
        setIsNameErr(true);
        toast.error("Invalid username");
        setIsLoading(false);
        return;
      }
      if (reqData.message === "Invalid email") {
        toast.error("Invalid email");
        setIsLoading(false);
        return;
      }
      if (reqData.message === "Ticket not enough") {
        toast.info("Maaf Saat Ini Ticket Sudah Habis");
        setIsLoading(false);
        mutate();
        return;
      }
      window?.snap?.pay(reqData?.token?.token, {
        async onError() {
          await handleFail(newId);
          setIsLoading(false);
          mutate();
        },
        async onClose() {
          await handleFail(newId);
          setIsLoading(false);
          mutate();
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Ups Terjadi Kesalahan");
      } else {
        toast.error("Ups Terjadi Kesalahan");
      }
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFail = async (order_id: string) => {
    await fetch("/api/event", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id,
      }),
    }).catch(() => toast.error("Ups Terjadi Kesalahan"));
  };

  return (
    <>
      {event && (
        <main className="bg-[#0b0105] backdrop-blur-2xl flex flex-col mx-auto select-none">
          <section className="h-full w-full bg-[#770b4d] relative mx-auto">
            <Image
              src={"/images/bnc_2025/tree_(right).webp"}
              alt="tree"
              width={1000}
              height={1000}
              className="absolute right-0 top-[-12%] w-[38%] h-auto z-10"
            ></Image>
            <div className="w-full min-h-full flex justify-center items-center relative">
              <Image
                src={"/images/bnc_2025/stars_falling.webp"}
                alt="stars_failling"
                width={500}
                height={500}
                className="absolute left-[4%] top-[3%] w-[40%] h-auto z-[0]"
              />

              <Image
                src={"/images/bnc_2025/sky_haze.webp"}
                alt="sky haze"
                width={500}
                height={500}
                className="absolute top-[10%] w-full h-auto z-[0]"
              />
              <Image
                src={"/images/bnc_2025/sky_haze_bottom.webp"}
                alt="sky haze bottom"
                width={500}
                height={500}
                className="absolute top-[58%] w-full h-auto z-[0]"
              />

              <Image
                src={"/images/bnc_2025/the_moon.webp"}
                alt="moon"
                width={1000}
                height={1000}
                className="w-full h-auto z-[1] blur-[2px]"
              />

              <Image
                src={"/images/bnc_2025/bhima_night_carnival.webp"}
                alt="bnc"
                width={1000}
                height={1000}
                className="absolute left-1/2 top-[30%] -translate-x-1/2
               w-[60%] max-w-[800px] h-auto z-[2]"
              />

              {/* <Image
                src={"/images/bnc_2025/hills.webp"}
                alt="hills"
                width={1000}
                height={1000}
                className="w-full h-auto absolute left-0 top-full -translate-y-[60%] z-[3]"
              />
              <section className="w-full h-auto absolute left-0 top-full -translate-y-[25%] z-[4] overflow-hidden">
                <div className="w-full h-full overflow-hidden">
                  <Image
                    src={"/images/bnc_2025/forrest.webp"}
                    alt="forrest"
                    width={1000}
                    height={1000}
                    className="w-full h-auto"
                  />
                </div>
                <Image
                  src={"/images/bnc_2025/haze.webp"}
                  alt="haze"
                  width={1000}
                  height={1000}
                  className="absolute top-1/7 left-0 w-full h-auto"
                />
              </section> */}
            </div>
          </section>
          {/* <section className="w-full h-[150dvw] bg-[#0b0105]"></section> */}
          <section className="w-full bg-[#0b0105] px-7 flex flex-col gap-3 relative z-50">
            <Image
              src={"/images/bnc_2025/hills.webp"}
              alt="hills"
              width={1000}
              height={1000}
              className="w-full h-auto absolute left-0 top-0 -translate-y-[60%] z-[3]"
            />
            <section className="w-full absolute left-0 top-0 -translate-y-[25%] z-[4] overflow-hidden">
              <div className="w-full relative h-auto overflow-hidden">
                <Image
                  src={"/images/bnc_2025/forrest.webp"}
                  alt="forrest"
                  width={1000}
                  height={1000}
                  className="w-full h-auto object-cover object-center"
                />
              </div>
              <Image
                src={"/images/bnc_2025/haze.webp"}
                alt="haze"
                width={1000}
                height={1000}
                className="absolute top-1/7 left-0 w-full h-auto"
              />
            </section>

            <div className="bg-transparent max-w-3xl mx-auto text-justify relative z-[10] mt-52">
              <div className="border p-3 rounded-xl">
                <div className="absolute left-0 top-0 w-full h-full bg-[#3e042c] blur-xl rounded-2xl z-[-1]"></div>
                <p className="text-white sm:text-2xl sm:leading-[32px]">
                  {detailEvent.description}
                </p>
              </div>
              <p className="text-center text-[13px] text-yellow-400/90 mt-3">
                {`*QRIS yang benar adalah "Warung Jujugan"`}
              </p>
            </div>
            <form
              action=""
              onSubmit={(e) => handleCheckout(e)}
              className="bg-transparent relative flex flex-col p-4 gap-5 rounded-xl mx-auto w-full max-w-3xl z-10"
            >
              <div className="absolute left-0 top-0 w-full h-full bg-[#3e042c] blur-xl rounded-2xl z-[-1]"></div>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  className="w-full bg-[#9a4875] text-white outline-none p-2 py-1 rounded-lg sm:text-xl text-base"
                  placeholder="Nama"
                  defaultValue={name}
                  required
                  min={3}
                  max={50}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsNameErr(false);
                  }}
                />
                {isNameErr && (
                  <p className="text-red-500 text-sm -mt-2 ml-2">
                    Hanya boleh mengandung huruf & angka
                  </p>
                )}
                <input
                  type="text"
                  className="w-full bg-[#9a4875] text-white outline-none p-2 py-1 rounded-lg sm:text-xl text-base"
                  placeholder="Email"
                  required
                  defaultValue={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailInfoOpen(true);
                  }}
                />
                {isEmailInfoOpen && (
                  <p className="text-orange-400 text-sm -mt-2 -mb-2 ml-2">
                    Pastikan email yang kamu masukkan sesuai dan aktif!
                  </p>
                )}
              </div>
              <aside className="w-full rounded-lg flex justify-between items-center">
                <Counter
                  maxCount={event?.ticket}
                  count={count}
                  setCount={setCount}
                />
                <div className="flex gap-2 sm:gap-5 items-center">
                  <p className="text-white sm:text-xl">
                    {toIdr(event?.price * count)}
                  </p>
                  <button
                    disabled={count > event?.ticket || isLoading}
                    type="submit"
                    className={`bg-[#873567] py-1 rounded-lg text-white cursor-pointer hover:bg-[#873567]/80 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed sm:text-xl ${
                      event?.ticket <= 0 ? "px-3" : "px-4"
                    }`}
                  >
                    {event?.ticket <= 0 ? "Tiket Habis" : "Beli Tiket"}
                  </button>
                </div>
              </aside>
            </form>
          </section>
        </main>
      )}
    </>
  );
}
