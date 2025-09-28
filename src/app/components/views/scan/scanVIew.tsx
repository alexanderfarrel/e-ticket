"use client";
import { useRef, useState } from "react";
import AdminLayout from "../../layouts/admin/adminLayout";
import { Html5Qrcode } from "html5-qrcode";
import { CustDataInterface } from "../../interfaces/qrCode";
import { useSession } from "next-auth/react";
import { SessionInterface } from "../../interfaces/session";
import { toast } from "sonner";
export default function ScanView() {
  const { data } = useSession();
  const session: SessionInterface = data as SessionInterface;
  const readerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const [decodedResult, setDecodedResult] = useState<string>("-");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [custData, setCustData] = useState<CustDataInterface | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isStartScanActive, setIsStartScanActive] = useState<boolean>(false);
  const [isLogoutScanActive, setIsLogoutScanActive] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const startScanner = async () => {
    if (!readerRef.current) return;

    if (!qrRef.current) {
      qrRef.current = new Html5Qrcode(readerRef.current.id);
    }

    setIsScanning(true);
    setIsError(false);
    try {
      setIsStartScanActive(true);
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
          if (res.status !== 200 && res.status !== 500) {
            setIsError(true);
            setErrorText("Invalid");
            setIsStartScanActive(false);
            setIsScanning(false);
            setCustData(data);
            return toast.error(data.message);
          }
          if (res.status === 500) {
            setIsError(true);
            setErrorText("Server Error");
            setIsStartScanActive(false);
            setIsScanning(false);
            setCustData(data);
            return toast.error("Internal Server Error");
          }
          setIsStartScanActive(false);
          setCustData(data);
          setIsScanning(false);
          if (data.message === "Scanned")
            return toast.error("User sudah pernah masuk!");
          return toast.success("User boleh masuk!");
        },
        () => {}
      );
    } catch {
      toast.error("ups something went wrong ~ try refreshing the page");
    }
  };

  const stopScanner = async () => {
    if (qrRef?.current && isScanning) {
      try {
        await qrRef.current.stop();
        setIsScanning(false);
        setIsLogoutScanActive(false);
        setIsStartScanActive(false);
      } catch {
        toast.error("ups something went wrong ~ try refreshing the page");
      }
    }
  };

  const handleStartScan = () => {
    if (isLogoutScanActive) return;

    if (isScanning) {
      stopScanner();
    } else {
      setDecodedResult("-");
      setCustData(null);
      startScanner();
    }
    return;
  };

  // const startLogoutScan = async () => {
  //   if (!readerRef.current) return;

  //   if (!qrRef.current) {
  //     qrRef.current = new Html5Qrcode(readerRef.current.id);
  //   }

  //   setIsScanning(true);
  //   setIsError(false);
  //   try {
  //     setIsLogoutScanActive(true);
  //     await qrRef.current.start(
  //       { facingMode: "environment" },
  //       { fps: 10 },
  //       async (decodedText) => {
  //         setDecodedResult(decodedText);
  //         qrRef?.current?.stop();
  //         const res = await fetch(`/api/qr?qrCode=${decodedText}`, {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //             authorization: `Bearer ${session?.accessToken}`,
  //           },
  //         });
  //         const data = await res?.json();
  //         if (data.message === "Unauthorized") {
  //           setIsError(true);
  //           setIsScanning(false);
  //           setIsLogoutScanActive(false);
  //           setErrorText("Unauthorized");
  //           setTimeout(() => {
  //             return (window.location.href = "/unauthorized");
  //           }, 2000);
  //         } else if (data.message === "Not found") {
  //           setIsError(true);
  //           setIsScanning(false);
  //           setIsLogoutScanActive(false);
  //           setErrorText("Not Found");
  //           return toast.error("qr tidak terdaftar!");
  //         } else if (data.message === "Belum Pernah di scan!") {
  //           setIsError(true);
  //           setIsScanning(false);
  //           setIsLogoutScanActive(false);
  //           setErrorText("Unscanned");
  //           return toast.error("Belum Pernah di scan!");
  //         } else if (data.message === "Already Exited") {
  //           setIsError(true);
  //           setIsScanning(false);
  //           setIsLogoutScanActive(false);
  //           setErrorText("Invalid");
  //           setCustData(data);
  //           return toast.error("Sudah Pernah Keluar!");
  //         }
  //         setCustData(data);
  //         setIsLogoutScanActive(false);
  //         setIsScanning(false);
  //         return toast.success("User boleh keluar!");
  //       },
  //       () => {}
  //     );
  //   } catch {
  //     toast.error("ups something went wrong ~ try refreshing the page");
  //   }
  // };

  // const handleScanLogout = () => {
  //   if (isStartScanActive) {
  //     return;
  //   }

  //   if (isScanning) {
  //     stopScanner();
  //   } else {
  //     setDecodedResult("-");
  //     setCustData(null);
  //     startLogoutScan();
  //   }
  //   return;
  // };
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
              ? custData?.data?.isScanned
                ? "bg-red-400 text-red-700/80"
                : "text-green-700/80 bg-green-300"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {isError
            ? errorText
            : custData
            ? custData?.data?.isScanned
              ? "Scanned"
              : "Unscanned"
            : "---------"}
        </p>
        <section className="w-full max-h-[30dvh] overflow-y-auto rounded-xl overflow-x-hidden">
          <table className="table-auto w-full border-separate break-all">
            <tbody className="bg-gray-400/50">
              <tr className="bg-gray-300">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">Nama</td>
                <td className="p-1 w-full">{custData?.data?.name || "-"}</td>
              </tr>
              <tr>
                <td className="p-1 pr-3 whitespace-nowrap font-bold">Email</td>
                <td className="p-1 w-full">{custData?.data?.email || "-"}</td>
              </tr>
              <tr className="bg-gray-300">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">Event</td>
                <td className="p-1 w-full">
                  {custData?.data?.event_name || "-"}
                </td>
              </tr>
              <tr className="bg-gray-300">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">
                  Scanned At
                </td>
                <td className="p-1 w-full">
                  {custData?.data?.scanned_at || "-"}
                </td>
              </tr>
              <tr className="p-2">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">Action</td>
                <td className="p-1 w-full">{custData?.data?.action || "-"}</td>
              </tr>
              <tr className="p-2">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">QRcode</td>
                <td className="p-1 w-full">{decodedResult}</td>
              </tr>
              <tr className="bg-gray-300">
                <td className="p-1 pr-3 whitespace-nowrap font-bold">
                  Order ID
                </td>
                <td className="p-1 w-full">
                  {custData?.data?.order_id || "-"}
                </td>
              </tr>
              <tr>
                <td className="p-1 pr-3 whitespace-nowrap font-bold">
                  Payment Type
                </td>
                <td className="p-1 w-full">
                  {custData?.data?.payment_type || "-"}
                </td>
              </tr>
              <tr>
                <td className="p-1 pr-3 whitespace-nowrap font-bold">
                  Payment Date
                </td>
                <td className="p-1 w-full">
                  {custData?.data?.transaction_time || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="flex w-full my-auto justify-between">
          {/* <button className="opacity-0">Log</button> */}
          <button
            disabled={isLogoutScanActive}
            onClick={handleStartScan}
            className="bg-blue-500 px-12 py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer hover:bg-blue-500/80 mx-auto text-white "
          >
            {isScanning ? "Stop" : "Start"} Scan
          </button>
          {/* <button
            className="bg-red-500 p-1 px-2 rounded-lg cursor-pointer hover:bg-red-500/80 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isStartScanActive}
            onClick={handleScanLogout}
          >
            <Image
              className="w-[31px] h-[35px]"
              src="/images/logout.png"
              alt="logout"
              width={15}
              height={15}
            />
          </button> */}
        </div>
      </div>
    </AdminLayout>
  );
}
