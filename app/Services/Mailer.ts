import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

export default class mailer{
    public static async sendMailConfirmation(emailData,subject,email){        
        try {
    
            await Mail.send((message) => {
              message
                .from(Env.get('SMTP_USERNAME'),'BLUELOG')
                .to(email)
                .subject(subject)
                .htmlView('emails/Confirmation', emailData)
            })
            return emailData
        } catch (error) {
            return null
        }
    }
    public static async sendMailCode(emailData,subject,email){        
        try {
    
            await Mail.send((message) => {
              message
                .from(Env.get('SMTP_USERNAME'),'BLUELOG')
                .to(email)
                .subject(subject)
                .htmlView('emails/Auth', emailData)
            })
            return emailData
        } catch (error) {
            return null
        }
    }
}