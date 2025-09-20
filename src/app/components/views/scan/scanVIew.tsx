"use client";
import { useRef, useState } from "react";
import AdminLayout from "../../layouts/admin/adminLayout";
import { Html5Qrcode } from "html5-qrcode";
import { QrCodeInterface } from "../../interfaces/qrCode";
import { useSession } from "next-auth/react";
import { SessionInterface } from "../../interfaces/session";
export default function ScanView() {
  const { data } = useSession();
  const session: SessionInterface = data as SessionInterface;
  const readerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const [decodedResult, setDecodedResult] = useState<string>("-");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [custData, setCustData] = useState<QrCodeInterface | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const startScanner = async () => {
    if (!readerRef.current) return;

    if (!qrRef.current) {
      qrRef.current = new Html5Qrcode(readerRef.current.id);
    }

    setIsScanning(true);
    setIsError(false);
    try {
      await qrRef.current.start(
        { facingMode: "environment" },
        { fps: 10 },
        async (decodedText) => {
          setDecodedResult(decodedText);
          qrRef?.current?.stop();
          const res = await fetch(`/api/qr?qrCode=${decodedText}`, {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${session?.accessToken}`,
            },
          });
          const data = await res?.json();
          if (data.message === "Unauthorized") {
            setIsError(true);
            setIsScanning(false);
            setTimeout(() => {
              return (window.location.href = "/unauthorized");
            }, 2000);
          }
          setCustData(data);
          setIsScanning(false);
        },
        () => {}
      );
    } catch {
      alert("ups something went wrong ~ try refreshing the page");
    }
  };

  const stopScanner = async () => {
    if (qrRef?.current && isScanning) {
      try {
        await qrRef.current.stop();
        setIsScanning(false);
      } catch {
        alert("ups something went wrong ~ try refreshing the page");
      }
    }
  };

  const handleBtnClick = () => {
    if (isScanning) {
      stopScanner();
    } else {
      setDecodedResult("-");
      setCustData(null);
      startScanner();
    }
  };

  return (
    <AdminLayout isFixHeight name={session?.user?.name}>
      <div className="h-[100dvh] w-full flex flex-col items-center px-5">
        <div className="max-w-[400px] w-full aspect-[4/3] border-2 border-orange-400 bg-orange-300 rounded-xl mt-[70px] mx-5 overflow-hidden">
          <div id="reader" ref={readerRef} className="w-full h-full"></div>
        </div>
        <p
          className={`text-center font-bold  px-5 py-1 rounded-xl my-2 mt-4 ${
            isError
              ? "bg-amber-300 text-amber-500"
              : custData
              ? custData?.isScanned
                ? "bg-red-400 text-red-700/80"
                : "text-green-700/80 bg-green-300"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {isError
            ? "Unauthorized"
            : custData
            ? custData?.isScanned
              ? "Scanned"
              : "Unscanned"
            : "---------"}
        </p>
        <section className="w-full max-h-[30dvh] overflow-y-scroll rounded-xl overflow-hidden">
          <table className="table-auto w-full border-separate break-all">
            <tbody className="bg-gray-400/50">
              <tr className="p-2">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">
                  Order ID
                </td>
                <td className="p-1 w-full">{decodedResult}</td>
              </tr>
              <tr className="bg-gray-300">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">Name</td>
                <td className="p-1 w-full">{custData?.name || "-"}</td>
              </tr>
              <tr>
                <td className="p-1 pr-3 whitespace-nowrap font-bold">Email</td>
                <td className="p-1 w-full">{custData?.email || "-"}</td>
              </tr>
              <tr className="bg-gray-300">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">Event</td>
                <td className="p-1 w-full">{custData?.event_name || "-"}</td>
              </tr>
              <tr>
                <td className="p-1 pr-3 whitespace-nowrap font-bold">Ticket</td>
                <td className="p-1 w-full">{custData?.ticket || "-"}</td>
              </tr>
              <tr className="bg-gray-300">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">
                  Scanned At
                </td>
                <td className="p-1 w-full">{custData?.scanned_at || "-"}</td>
              </tr>
              <tr>
                <td className="p-1 pr-3 whitespace-nowrap font-bold">
                  Payment Type
                </td>
                <td className="p-1 w-full">{custData?.payment_type || "-"}</td>
              </tr>
              <tr>
                <td className="p-1 pr-3 whitespace-nowrap font-bold">
                  Timestamp
                </td>
                <td className="p-1 w-full">
                  {custData?.transaction_time || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <button
          onClick={handleBtnClick}
          className="bg-blue-500 px-16 py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer hover:bg-blue-500/80 text-white my-auto "
        >
          {isScanning ? "Stop" : "Start"} Scan
        </button>
      </div>
    </AdminLayout>
  );
}
