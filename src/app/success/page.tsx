import { Link } from "next-view-transitions";

export default function successPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="font-semibold text-green-500 text-[4rem] leading-[3rem] max-sm:text-3xl">
          Pembayaran Berhasil
        </p>
        <h1 className="mt-4 text-7xl font-semibold tracking-tight text-balance text-gray-900 max-sm:text-2xl max-sm:mt-0">
          Terimakasih Atas Pembeliannya
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-orange-500 sm:text-xl/8 max-sm:text-base max-sm:mt-1">
          {`Cek folder spam jika email tidak muncul di inbox`}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6 max-sm:mt-4">
          <Link
            href="/"
            className="border-2 rounded-xl bg-green-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-green-500/80 max-sm:py-2"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
