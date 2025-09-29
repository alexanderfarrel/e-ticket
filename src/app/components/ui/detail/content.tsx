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
  const [count, setCount] = useState<number>(3);
  const [isNameErr, setIsNameErr] = useState<boolean>(false);
  const [isEmailInfoOpen, setIsEmailInfoOpen] = useState<boolean>(false);
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
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

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please fill in your name and email");
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
        <section className="mt-8 w-full flex flex-col items-center px-5">
          <div className="max-w-[900px] w-full">
            <div className="overflow-hidden rounded-lg w-full select-none aspect-video border">
              <Image
                src={"/images/bhima_night_carnival.png"}
                alt=""
                width={1000}
                height={1000}
                objectFit="contain"
                objectPosition="center"
                className="w-full h-full"
              />
            </div>
            {/* <h1 className="text-2xl font-bold">{slug}</h1> */}
            <div className="flex justify-between font-bold mt-3 mb-2">
              <p className="">
                Ticket : <span>{event?.ticket}</span>
              </p>
              <p className="font-medium">{toIdr(event?.price)}</p>
            </div>
            <p className="text-justify max-sm:text-base">
              {event?.description}
            </p>
            {count > event?.ticket && (
              <p className="mt-3 -mb-2 text-red-500">
                Ticket Saat Ini Tidak Tersedia
              </p>
            )}

            <form
              action=""
              onSubmit={(e) => handleCheckout(e)}
              className="bg-[#eee] flex flex-col p-3 mt-4 gap-5 rounded-lg"
            >
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  className="w-full bg-white outline-none p-2 py-1 rounded-lg"
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
                  className="w-full bg-white outline-none p-2 py-1 rounded-lg"
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
                <div className="text-[14px]">
                  <Counter
                    maxCount={event?.ticket}
                    count={count}
                    setCount={setCount}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <p>{toIdr(event?.price * count)}</p>
                  <button
                    disabled={count > event?.ticket || isLoading}
                    type="submit"
                    className="bg-blue-500 px-4 py-1 rounded-lg text-white cursor-pointer hover:bg-blue-600 transition-all disabled:bg-blue-500/70 disabled:cursor-not-allowed"
                  >
                    Beli Tiket
                  </button>
                </div>
              </aside>
            </form>
          </div>
        </section>
      )}
      <div
        className="text-center mt-5 cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText("4811 1111 1111 1114");
          toast.success("Copied");
        }}
      >
        <p>By Mastercard : </p>
        <p className="">4811 1111 1111 1114</p>
      </div>
    </>
  );
}
