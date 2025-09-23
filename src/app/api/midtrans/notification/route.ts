import { PaymentStatusInterface } from "@/app/components/interfaces/paymentStatus";
import {
  addData,
  deleteById,
  retrieveDataByField,
  retrieveDataById,
} from "@/libs/firebase/service";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import toDate from "@/app/components/utils/toDate";
import { QrCodeInterface } from "@/app/components/interfaces/qrCode";

const ALPHABET: string = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateCode(length: number = 15): string {
  let result: string = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += ALPHABET[array[i] % ALPHABET.length];
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
      transaction_time,
      payment_type,
    } = body;
    if (transaction_status === "expire") {
      await fetch(`${process.env.NEXTAUTH_URL}/api/event`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id,
        }),
      });
    }
    if (
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept")
    ) {
      const dataPayment: PaymentStatusInterface[] = (await retrieveDataByField(
        "payment_status",
        "order_id",
        order_id
      )) as PaymentStatusInterface[];
      if (dataPayment.length > 0) {
        await deleteById("payment_status", dataPayment[0].id!);

        try {
          let code: string = "";
          let exists: boolean = true;
          for (let i = 0; i < 50 && exists; i++) {
            code = generateCode();
            const dataCode = await retrieveDataByField(
              "qr_detail",
              "qr_code",
              code
            );
            if (dataCode.length === 0) {
              exists = false;
              break;
            }
          }
          if (exists) {
            return NextResponse.json(
              { message: "Failed to create qr code" },
              { status: 500 }
            );
          }

          const data: QrCodeInterface = {
            qr_code: code,
            id_event: dataPayment[0].event_id,
            name: dataPayment[0].name,
            email: dataPayment[0].email,
            isScanned: false,
            transaction_id,
            transaction_time,
            payment_type,
            ticket: dataPayment[0].ticket,
            order_id,
            event_name: dataPayment[0].event_name,
            scanned_at: "-",
          };

          const newData = await addData("qr_detail", data);
          if (newData.status) {
            const event = await retrieveDataById(
              "event",
              dataPayment[0].event_id
            );
            const qrImage = await QRCode.toDataURL(code, {
              width: 500,
              margin: 2,
            });

            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.DEFAULT_EMAIL_USER_ADMIN,
                pass: process.env.DEFAULT_EMAIL_PASSWORD_ADMIN,
              },
            });

            const dateConvert = toDate(event?.timestamp)
              .toLocaleDateString("id-ID")
              .split("/")
              .join("-");
            const imageName = event?.src.slice(event?.src.lastIndexOf("/") + 1);

            const result = await transporter.sendMail({
              from: process.env.DEFAULT_EMAIL_USER_ADMIN,
              to: dataPayment[0].email,
              subject: "Ticket QR Code by Sma Negeri 1 Madiun",
              html: `
                <!--
        * This email was built using Tabular.
        * For more information, visit https://tabular.email
        -->
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
        <head>
        <title></title>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <!--[if !mso]>-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <!--<![endif]-->
        <meta name="x-apple-disable-message-reformatting" content="" />
        <meta content="target-densitydpi=device-dpi" name="viewport" />
        <meta content="true" name="HandheldFriendly" />
        <meta content="width=device-width" name="viewport" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
        <style type="text/css">
        table {
        border-collapse: separate;
        table-layout: fixed;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt
        }
        table td {
        border-collapse: collapse
        }
        .ExternalClass {
        width: 100%
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
        line-height: 100%
        }
        body, a, li, p, h1, h2, h3 {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        }
        html {
        -webkit-text-size-adjust: none !important
        }
        body {
        min-width: 100%;
        Margin: 0px;
        padding: 0px;
        }
        body, #innerTable {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale
        }
        #innerTable img+div {
        display: none;
        display: none !important
        }
        img {
        Margin: 0;
        padding: 0;
        -ms-interpolation-mode: bicubic
        }
        h1, h2, h3, p, a {
        line-height: inherit;
        overflow-wrap: normal;
        white-space: normal;
        word-break: break-word
        }
        a {
        text-decoration: none
        }
        h1, h2, h3, p {
        min-width: 100%!important;
        width: 100%!important;
        max-width: 100%!important;
        display: inline-block!important;
        border: 0;
        padding: 0;
        margin: 0
        }
        a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important
        }
        u + #body a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
        }
        a[href^="mailto"],
        a[href^="tel"],
        a[href^="sms"] {
        color: inherit;
        text-decoration: none
        }
        </style>
        <style type="text/css">
        @media (min-width: 481px) {
        .hd { display: none!important }
        }
        </style>
        <style type="text/css">
        @media (max-width: 480px) {
        .hm { display: none!important }
        }
        </style>
        <style type="text/css">
        @media (max-width: 480px) {
        .t10,.t5{color:#1a1a1a!important}.t127,.t132,.t137,.t142,.t146,.t42,.t46,.t58,.t62,.t74,.t78,.t90,.t94{vertical-align:top!important}.t1{padding-top:0!important}.t114{padding:40px 30px!important;background-color:#f7f7f7!important}.t11{padding-bottom:20px!important}.t10{line-height:28px!important;font-size:26px!important;letter-spacing:-1.04px!important}.t165{padding:40px 30px!important}.t151{padding-bottom:36px!important}.t147{text-align:center!important}.t125,.t130,.t135,.t140{display:revert!important}.t127,.t132,.t137,.t142{width:49px!important}.t146{width:24px!important}.t104,.t34{border-radius:0!important}.t47,.t63,.t79,.t95{text-align:left!important}.t42,.t58,.t74,.t90{width:200px!important}.t46,.t62,.t78,.t94{width:600px!important}
        }
        </style>
        <!--[if !mso]>-->
        <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,500;0,800;1,500&amp;family=Roboto:wght@700&amp;family=Inter+Tight:wght@500;600&amp;display=swap" rel="stylesheet" type="text/css" />
        <!--<![endif]-->
        <!--[if mso]>
        <xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        </head>
        <body id="body" class="t171" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t170" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t169" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
        <!--[if mso]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
        <v:fill color="#242424"/>
        </v:background>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
        <table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t3" style="width:600px;">
        <table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1" style="padding:48px 0 0 0;"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="600" height="356.25" alt="" src="cid:banner"/></div></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t117" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t116" style="width:600px;">
        <table class="t115" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t114" style="background-color:#F8F8F8;padding:60px 50px 60px 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
        <table class="t9" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t8" style="width:600px;">
        <table class="t7" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t6" style="padding:0 0 6px 0;"><h1 class="t5" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:800;font-style:normal;font-size:16px;text-decoration:none;text-transform:uppercase;letter-spacing:3px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;">E-Ticket smasa</h1></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t14" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t13" style="width:600px;">
        <table class="t12" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t11"><h1 class="t10" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Pembelian Ticket Berhasil 🎊</h1></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td><div class="t15" style="mso-line-height-rule:exactly;mso-line-height-alt:6px;line-height:6px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
        <table class="t20" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t19" style="width:600px;">
        <table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h2 class="t16" style="margin:0;Margin:0;font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Hai ${dataPayment[0].name} 👋🏻</h2></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
        <table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t25" style="width:600px;">
        <table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Berikut adalah QR Code kamu<br/>Tunjukkan QR Code ini pada panitia</p></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td><div class="t33" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
        <table class="t37" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="250" class="t36" style="width:250px;">
        <table class="t35" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t34" style="overflow:hidden;background-color:#F6F6F6;border-radius:12px 12px 12px 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td><div class="t28" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
        <table class="t32" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="250" class="t31" style="width:300px;">
        <table class="t30" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t29"><div style="font-size:0px;"><img class="t27" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="250" height="250" alt="" src="cid:qrcode"/></div></td></tr></table>
        </td></tr></table>
        </td></tr></table></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td><div class="t38" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td><div class="t103" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
        <table class="t107" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="440" class="t106" style="width:440px;">
        <table class="t105" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t104" style="overflow:hidden;background-color:#F6F6F6;padding:30px 40px 30px 40px;border-radius:12px 12px 12px 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
        <table class="t54" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="360" class="t53" style="width:800px;">
        <table class="t52" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t51"><div class="t50" style="width:100%;text-align:left;"><div class="t49" style="display:inline-block;"><table class="t48" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
        <tr class="t47"><td></td><td class="t42" width="90" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t41" style="width:100%;"><tr><td class="t40"><p class="t39" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:600;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Ticket</p></td></tr></table>
        </td><td class="t46" width="270" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t45" style="width:100%;"><tr><td class="t44"><p class="t43" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#787878;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${dataPayment[0].ticket}</p></td></tr></table>
        </td>
        <td></td></tr>
        </table></div></div></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t70" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="360" class="t69" style="width:800px;">
        <table class="t68" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t67"><div class="t66" style="width:100%;text-align:left;"><div class="t65" style="display:inline-block;"><table class="t64" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
        <tr class="t63"><td></td><td class="t58" width="90" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t57" style="width:100%;"><tr><td class="t56"><p class="t55" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:600;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Event</p></td></tr></table>
        </td><td class="t62" width="270" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t61" style="width:100%;"><tr><td class="t60"><p class="t59" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#787878;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${event?.title}</p></td></tr></table>
        </td>
        <td></td></tr>
        </table></div></div></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t86" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="360" class="t85" style="width:800px;">
        <table class="t84" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t83"><div class="t82" style="width:100%;text-align:left;"><div class="t81" style="display:inline-block;"><table class="t80" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
        <tr class="t79"><td></td><td class="t74" width="90" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t73" style="width:100%;"><tr><td class="t72"><p class="t71" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:600;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Tanggal</p></td></tr></table>
        </td><td class="t78" width="270" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t77" style="width:100%;"><tr><td class="t76"><p class="t75" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#787878;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${dateConvert}</p></td></tr></table>
        </td>
        <td></td></tr>
        </table></div></div></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t102" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="360" class="t101" style="width:800px;">
        <table class="t100" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t99"><div class="t98" style="width:100%;text-align:left;"><div class="t97" style="display:inline-block;"><table class="t96" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
        <tr class="t95"><td></td><td class="t90" width="90" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t89" style="width:100%;"><tr><td class="t88"><p class="t87" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:600;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Lokasi</p></td></tr></table>
        </td><td class="t94" width="270" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t93" style="width:100%;"><tr><td class="t92"><p class="t91" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#787878;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${event?.location}</p></td></tr></table>
        </td>
        <td></td></tr>
        </table></div></div></td></tr></table>
        </td></tr></table>
        </td></tr></table></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td><div class="t108" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
        <table class="t113" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t112" style="width:600px;">
        <table class="t111" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t110" style="padding:0 0 3px 0;"><p class="t109" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:italic;font-size:16px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Salam Hangat, Panitia Event</p></td></tr></table>
        </td></tr></table>
        </td></tr></table></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t168" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t167" style="width:600px;">
        <table class="t166" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t165" style="padding:48px 50px 48px 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
        <table class="t122" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t121" style="width:600px;">
        <table class="t120" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t119"><p class="t118" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Temukan Kami di Media Sosial</p></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t154" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t153" style="width:800px;">
        <table class="t152" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t151" style="padding:10px 0 10px 0;"><div class="t150" style="width:100%;text-align:center;"><div class="t149" style="display:inline-block;"><table class="t148" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
        <tr class="t147"><td></td><td class="t127" width="49" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t126" style="width:100%;"><tr><td class="t124"><div style="font-size:0px;"><img class="t123" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/50f96a91-e655-4327-82d4-7dae95c9726b.png"/></div></td><td class="t125" style="width:25px;" width="25"></td></tr></table>
        </td><td class="t132" width="49" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t131" style="width:100%;"><tr><td class="t129"><div style="font-size:0px;"><img class="t128" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/35ae5083-3e59-4690-b516-547ebd1dd1ed.png"/></div></td><td class="t130" style="width:25px;" width="25"></td></tr></table>
        </td><td class="t137" width="49" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t136" style="width:100%;"><tr><td class="t134"><div style="font-size:0px;"><img class="t133" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/f5d11977-4471-4151-85ca-acd605ce3e83.png"/></div></td><td class="t135" style="width:25px;" width="25"></td></tr></table>
        </td><td class="t142" width="49" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t141" style="width:100%;"><tr><td class="t139"><div style="font-size:0px;"><img class="t138" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/ad4cbdba-1d06-45c3-a0cc-e06e8a17f665.png"/></div></td><td class="t140" style="width:25px;" width="25"></td></tr></table>
        </td><td class="t146" width="24" valign="top">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t145" style="width:100%;"><tr><td class="t144"><div style="font-size:0px;"><img class="t143" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/2c314951-5c74-40dd-9653-7087a0f19ae3.png"/></div></td></tr></table>
        </td>
        <td></td></tr>
        </table></div></div></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t159" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t158" style="width:600px;">
        <table class="t157" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t156"><p class="t155" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">Jl. Mastrip No.19, Mojorejo, Kec. Taman, Kota Madiun, Jawa Timur 63139</p></td></tr></table>
        </td></tr></table>
        </td></tr><tr><td align="center">
        <table class="t164" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="200" class="t163" style="width:200px;">
        <table class="t162" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t161" style="background-color:#242424;text-align:center;line-height:24px;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t160" href="https://sman1madiun.sch.id/" style="display:block;margin:0;Margin:0;font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:24px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;direction:ltr;color:#0A81FF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;" target="_blank">SMA Negeri 1 Madiun</a></td></tr></table>
        </td></tr></table>
        </td></tr></table></td></tr></table>
        </td></tr></table>
        </td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
        </html>
              `,
              attachments: [
                {
                  filename: imageName,
                  path: path.join(process.cwd(), "public", "images", imageName),
                  cid: "banner",
                },
                {
                  filename: "qrcode.png",
                  content: qrImage.split("base64,")[1],
                  encoding: "base64",
                  cid: "qrcode",
                },
              ],
            });

            if (result.accepted.length <= 0) {
              return NextResponse.json(
                { message: "Failed to send email" },
                { status: 500 }
              );
            }

            return NextResponse.json({ message: "Success" }, { status: 200 });
          }
          return NextResponse.json(
            { message: "Failed to create qr code" },
            { status: 500 }
          );
        } catch (error: unknown) {
          await addData("payment_status", dataPayment[0]);
          if (error instanceof Error) {
            return NextResponse.json(
              { message: error.message },
              { status: 500 }
            );
          }
          return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
          );
        }
      }
    }
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
