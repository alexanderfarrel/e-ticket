import { Link } from "next-view-transitions";

export default function successPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="font-semibold text-green-500 text-[4rem] leading-[3rem]">
          Pembayaran Berhasil
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          Terimakasih Atas Pembeliannya
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-orange-500 sm:text-xl/8">
          {`Cek folder spam jika email tidak muncul di inbox`}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="border-2 rounded-xl bg-green-400 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
