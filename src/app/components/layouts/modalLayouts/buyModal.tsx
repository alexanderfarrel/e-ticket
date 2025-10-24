import { toast } from "sonner";
import Modal from "../../common/modal";
import { useState } from "react";
import { EventInterface } from "../../interfaces/event";
import { v4 as uuidv4 } from "uuid";
import { Tooltip } from "../../common/toolTip";

export default function BuyModal({
  onClose,
  count,
  mutate,
  event,
}: {
  onClose: () => void;
  count: number;
  mutate: () => void;
  event: EventInterface | undefined;
}) {
  const [isUsernameErr, setIsUsernameErr] = useState<{
    [key: number]: boolean;
  }>({});
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConfirm) {
      setIsConfirm(true);
      return toast.info("Pastikan data sudah benar lalu klik sekali lagi");
    }
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const usernameRegex = /^[a-zA-Z0-9 ]{3,50}$/;
    const newErrors: { [key: number]: boolean } = {};
    for (let i = 0; i < count; i++) {
      const name = formData.get(`name${i}`) as string;
      newErrors[i] = usernameRegex.test(name) ? false : true;
    }
    setIsUsernameErr(newErrors);

    const hasError = Object.values(newErrors).some((v) => v);
    if (hasError) {
      setIsLoading(false);
      return toast.error("Username Tidak Valid");
    }
    try {
      const orderId = uuidv4().replace(/-/g, "").slice(0, 24);
      const names = Array.from(
        { length: count },
        (_, i) => formData.get(`name${i}`) as string
      );
      const data = {
        orderId,
        eventId: "5W7jcnr28tGc5E8tywRl",
        productName: event?.title,
        price: event?.price,
        quantity: count,
        email: formData.get("email") as string,
        names,
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
        toast.error("Invalid username");
        return;
      }
      if (reqData.message === "Invalid email") {
        toast.error("Invalid email");
        return;
      }
      if (reqData.message === "Ticket not enough") {
        toast.info("Maaf Saat Ini Ticket Sudah Habis");
        mutate();
        return;
      }
      if (res.status !== 200) {
        toast.error("Ups Terjadi Kesalahan");
        return;
      }
      window?.snap?.pay(reqData?.token?.token, {
        async onError() {
          await handleFail(orderId);

          mutate();
        },
        async onClose() {
          await handleFail(orderId);

          mutate();
        },
      });
    } catch {
      toast.error("Ups Terjadi Kesalahan");
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
    <Modal onClose={onClose} className="bg-white max-w-xl w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <h1 className="font-bold text-2xl">Isi Data Berikut</h1>
        <section className="max-h-[60dvh] overflow-y-scroll flex flex-col gap-[6px]">
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className="">
              <div className="flex gap-2 items-center">
                <label htmlFor={`name${index}`}>
                  Nama Lengkap {count > 1 && index + 1}
                </label>
                {count > 1 && index === 0 && (
                  <Tooltip label="Nama ini digunakan untuk customer detail">
                    <span className="text-orange-500 text-[14px]">
                      *pembeli
                    </span>
                  </Tooltip>
                )}
              </div>
              <input
                type="text"
                id={`name${index}`}
                name={`name${index}`}
                placeholder="sesuai KTP / Kartu Identitas"
                required
                min={3}
                max={50}
                className="w-full rounded-lg border-2 border-gray-300 px-2 py-1 mt-1"
              />
              {isUsernameErr[index] && (
                <p className="text-red-500 text-sm pl-[6px]">
                  hanya boleh mengandung huruf dan angka
                </p>
              )}
            </div>
          ))}
        </section>
        <div>
          <label htmlFor="nama">Email Aktif</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="sman1madiun@gmail.com"
            required
            className="w-full rounded-lg border-2 border-gray-300 px-2 py-1 mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white rounded-lg self-end px-3 py-1 mt-2 cursor-pointer hover:bg-blue-500/80 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Beli Sekarang
        </button>
      </form>
    </Modal>
  );
}
