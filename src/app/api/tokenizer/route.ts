import { NextRequest, NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { addData, retrieveDataById, updateData } from "@/libs/firebase/service";
import validator from "validator";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY ?? "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
});

export async function POST(req: NextRequest) {
  try {
    const { id, productName, price, quantity, name, email } = await req.json();
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(name)) {
      return NextResponse.json(
        { message: "Invalid username" },
        { status: 400 }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const eventId = id.split("-")[0];
    const eventData = await retrieveDataById("event", eventId);

    if (!eventData) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (eventData.ticket - quantity < 0) {
      return NextResponse.json(
        { message: "Ticket not enough" },
        { status: 400 }
      );
    }

    const newTicket = eventData.ticket - quantity;
    await updateData("event", eventId, {
      ticket: newTicket,
    });
    try {
      const parameter = {
        transaction_details: {
          order_id: id,
          gross_amount: price * quantity,
        },
        item_details: [
          {
            name: productName,
            price: price,
            quantity: quantity,
          },
        ],
        customer_details: {
          first_name: name,
          email: email,
        },
      };

      const token = await snap.createTransaction(parameter);
      if (token.token) {
        await addData("payment_status", {
          status: "pending",
          name,
          email,
          order_id: id,
          event_id: eventId,
          ticket: quantity,
          event_name: productName,
        });
      }

      return NextResponse.json({ token }, { status: 200 });
    } catch (err: unknown) {
      await updateData("event", eventId, {
        ticket: eventData.ticket,
      });
      if (typeof err === "object" && err !== null && "ApiResponse" in err) {
        const apiErr = err as { ApiResponse: { error_messages: string[] } };
        if (
          apiErr.ApiResponse.error_messages[0] ===
          "customer_details.email format is invalid"
        ) {
          return NextResponse.json(
            { message: "Invalid email" },
            { status: 400 }
          );
        }
      }

      if (err instanceof Error) {
        return NextResponse.json({ message: err.message }, { status: 500 });
      }

      return NextResponse.json(
        { message: "Create transaction failed, rollback success" },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// export async function PUT() {
//   const qrImage = await QRCode.toDataURL("AHJDKAHX3492DSHFAIUSF", {
//     width: 500,
//     margin: 2,
//   });

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.DEFAULT_EMAIL_USER_ADMIN,
//       pass: process.env.DEFAULT_EMAIL_PASSWORD_ADMIN,
//     },
//   });

//   await transporter.sendMail({
//     from: process.env.DEFAULT_EMAIL_USER_ADMIN,
//     to: "chikofarrel@gmail.com",
//     subject: "Ticket QR Code by Sma Negeri 1 Madiun",
//     html: `
//           <!--
// * This email was built using Tabular.
// * For more information, visit https://tabular.email
// -->
// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
// <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
// <head>
// <title></title>
// <meta charset="UTF-8" />
// <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
// <!--[if !mso]>-->
// <meta http-equiv="X-UA-Compatible" content="IE=edge" />
// <!--<![endif]-->
// <meta name="x-apple-disable-message-reformatting" content="" />
// <meta content="target-densitydpi=device-dpi" name="viewport" />
// <meta content="true" name="HandheldFriendly" />
// <meta content="width=device-width" name="viewport" />
// <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
// <style type="text/css">
// table {
// border-collapse: separate;
// table-layout: fixed;
// mso-table-lspace: 0pt;
// mso-table-rspace: 0pt
// }
// table td {
// border-collapse: collapse
// }
// .ExternalClass {
// width: 100%
// }
// .ExternalClass,
// .ExternalClass p,
// .ExternalClass span,
// .ExternalClass font,
// .ExternalClass td,
// .ExternalClass div {
// line-height: 100%
// }
// body, a, li, p, h1, h2, h3 {
// -ms-text-size-adjust: 100%;
// -webkit-text-size-adjust: 100%;
// }
// html {
// -webkit-text-size-adjust: none !important
// }
// body {
// min-width: 100%;
// Margin: 0px;
// padding: 0px;
// }
// body, #innerTable {
// -webkit-font-smoothing: antialiased;
// -moz-osx-font-smoothing: grayscale
// }
// #innerTable img+div {
// display: none;
// display: none !important
// }
// img {
// Margin: 0;
// padding: 0;
// -ms-interpolation-mode: bicubic
// }
// h1, h2, h3, p, a {
// line-height: inherit;
// overflow-wrap: normal;
// white-space: normal;
// word-break: break-word
// }
// a {
// text-decoration: none
// }
// h1, h2, h3, p {
// min-width: 100%!important;
// width: 100%!important;
// max-width: 100%!important;
// display: inline-block!important;
// border: 0;
// padding: 0;
// margin: 0
// }
// a[x-apple-data-detectors] {
// color: inherit !important;
// text-decoration: none !important;
// font-size: inherit !important;
// font-family: inherit !important;
// font-weight: inherit !important;
// line-height: inherit !important
// }
// u + #body a {
// color: inherit;
// text-decoration: none;
// font-size: inherit;
// font-family: inherit;
// font-weight: inherit;
// line-height: inherit;
// }
// a[href^="mailto"],
// a[href^="tel"],
// a[href^="sms"] {
// color: inherit;
// text-decoration: none
// }
// </style>
// <style type="text/css">
// @media (min-width: 481px) {
// .hd { display: none!important }
// }
// </style>
// <style type="text/css">
// @media (max-width: 480px) {
// .hm { display: none!important }
// }
// </style>
// <style type="text/css">
// @media (max-width: 480px) {
// .t43,.t48,.t53,.t58,.t62{vertical-align:top!important}.t1{padding-top:0!important}.t30{padding:40px 30px!important;background-color:#f7f7f7!important}.t5{color:#1a1a1a!important}.t27,.t29{max-width:420px!important}.t25{color:#f7f7f7!important}.t11{padding-bottom:20px!important}.t10{line-height:28px!important;font-size:26px!important;letter-spacing:-1.04px!important;color:#1a1a1a!important}.t84{padding:40px 30px!important}.t67{padding-bottom:36px!important}.t63{text-align:center!important}.t41,.t46,.t51,.t56{display:revert!important}.t43,.t48,.t53,.t58{width:49px!important}.t62{width:24px!important}
// }
// </style>
// <!--[if !mso]>-->
// <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,500;0,700;0,800;1,500&amp;display=swap" rel="stylesheet" type="text/css" />
// <!--<![endif]-->
// <!--[if mso]>
// <xml>
// <o:OfficeDocumentSettings>
// <o:AllowPNG/>
// <o:PixelsPerInch>96</o:PixelsPerInch>
// </o:OfficeDocumentSettings>
// </xml>
// <![endif]-->
// </head>
// <body id="body" class="t90" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t89" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t88" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
// <!--[if mso]>
// <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
// <v:fill color="#242424"/>
// </v:background>
// <![endif]-->
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
// <table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t3" style="width:600px;">
// <table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1" style="padding:48px 0 0 0;"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="600" height="356.25" alt="" src="cid:logo"/></div></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t33" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t32" style="width:600px;">
// <table class="t31" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t30" style="background-color:#F8F8F8;padding:60px 50px 60px 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
// <table class="t9" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t8" style="width:600px;">
// <table class="t7" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t6" style="padding:0 0 6px 0;"><h1 class="t5" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:800;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;letter-spacing:3px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Winter sales</h1></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t14" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t13" style="width:600px;">
// <table class="t12" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t11" style="padding:0 0 25px 0;"><h1 class="t10" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Time to treat yourself with savings this Winter.</h1></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t19" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t18" style="width:600px;">
// <table class="t17" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t16" style="padding:0 0 22px 0;"><p class="t15" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">The first mate and his Skipper too will do their very best to make the others comfortable in their tropic island nest. Michael Knight a young loner on a crusade to champion the cause of the innocent. The helpless. The powerless in a world of criminals who operate above the law. Here he comes Here comes Speed Racer. He&#39;s a demon on wheels.</p></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t24" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t23" style="width:600px;">
// <table class="t22" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t21" style="padding:0 0 40px 0;"><p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:italic;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Offers are available from December 1 through December 30. But why wait?</p></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t29" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;max-width:500px;"><tr><td class="t28" style="width:auto;">
// <table class="t27" role="presentation" cellpadding="0" cellspacing="0" style="width:auto;max-width:500px;"><tr><td class="t26" style="overflow:hidden;background-color:#171717;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:0 46px 0 46px;border-radius:44px 44px 44px 44px;"><span class="t25" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;">View all savings</span></td></tr></table>
// </td></tr></table>
// </td></tr></table></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t87" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t86" style="width:600px;">
// <table class="t85" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t84" style="padding:48px 50px 48px 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
// <table class="t38" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t37" style="width:600px;">
// <table class="t36" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t35"><p class="t34" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Want updates through more platforms?</p></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t70" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t69" style="width:800px;">
// <table class="t68" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t67" style="padding:10px 0 44px 0;"><div class="t66" style="width:100%;text-align:center;"><div class="t65" style="display:inline-block;"><table class="t64" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
// <tr class="t63"><td></td><td class="t43" width="49" valign="top">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t42" style="width:100%;"><tr><td class="t40"><div style="font-size:0px;"><img class="t39" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/50f96a91-e655-4327-82d4-7dae95c9726b.png"/></div></td><td class="t41" style="width:25px;" width="25"></td></tr></table>
// </td><td class="t48" width="49" valign="top">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t47" style="width:100%;"><tr><td class="t45"><div style="font-size:0px;"><img class="t44" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/35ae5083-3e59-4690-b516-547ebd1dd1ed.png"/></div></td><td class="t46" style="width:25px;" width="25"></td></tr></table>
// </td><td class="t53" width="49" valign="top">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t52" style="width:100%;"><tr><td class="t50"><div style="font-size:0px;"><img class="t49" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/f5d11977-4471-4151-85ca-acd605ce3e83.png"/></div></td><td class="t51" style="width:25px;" width="25"></td></tr></table>
// </td><td class="t58" width="49" valign="top">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t57" style="width:100%;"><tr><td class="t55"><div style="font-size:0px;"><img class="t54" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/ad4cbdba-1d06-45c3-a0cc-e06e8a17f665.png"/></div></td><td class="t56" style="width:25px;" width="25"></td></tr></table>
// </td><td class="t62" width="24" valign="top">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t61" style="width:100%;"><tr><td class="t60"><div style="font-size:0px;"><img class="t59" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://5315b7be-4a3b-4b68-a98d-29d6fc66bfca.b-cdn.net/e/10fdbaa2-5f77-45a3-8aba-9d03c712fed8/2c314951-5c74-40dd-9653-7087a0f19ae3.png"/></div></td></tr></table>
// </td>
// <td></td></tr>
// </table></div></div></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t75" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t74" style="width:600px;">
// <table class="t73" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t72"><p class="t71" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">4019 Waterview Lane, Santa Fe, NM, New Mexico 87500</p></td></tr></table>
// </td></tr></table>
// </td></tr><tr><td align="center">
// <table class="t83" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t82" style="width:600px;">
// <table class="t81" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t80"><p class="t79" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t76" href="{% unsubscribe_link %}" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>&nbsp; •&nbsp; <a class="t77" href="https://tabular.email" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>&nbsp; •&nbsp; <a class="t78" href="https://tabular.email" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td></tr></table>
// </td></tr></table>
// </td></tr></table></td></tr></table>
// </td></tr></table>
// </td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
// </html>
//         `,
//     attachments: [
//       {
//         filename: "tes.webp",
//         path: path.join(process.cwd(), "public", "images", "tes.webp"),
//         cid: "logo",
//       },
//       {
//         filename: "qrcode.png",
//         content: qrImage.split("base64,")[1],
//         encoding: "base64",
//         cid: "qrcode",
//       },
//     ],
//   });

//   return NextResponse.json({}, { status: 200 });
// }
