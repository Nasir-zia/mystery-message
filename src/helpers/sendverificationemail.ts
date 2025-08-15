import { resend } from "@/lib/resend"
import VerificationEmail from "../../emails/verification.email"
import {ApiResponse} from "@/types/ApiResponse";


export async function sendVerificationEmail(
  email: string,
  username: string,
  verifycode: string


): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Verify your email",
            react: VerificationEmail({
             username , otp: verifycode}),
        })
        return {success: true, message: "Verification email sent successfully"}
        
    } catch (emailerror) {
        console.error(emailerror , "Error sending verification email");
        return{success: false, message: "Error sending verification email"}
    }
}
