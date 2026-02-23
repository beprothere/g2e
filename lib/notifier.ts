import webpush from 'web-push';
import User from '@/models/User';

webpush.setVapidDetails(
  'mailto:support@glow2earn.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPush(userId: string, title: string, body: string, url: string = '/') {
  try {
    const user = await User.findById(userId).select('pushSubscription');
    
    if (!user || !user.pushSubscription || !user.pushSubscription.endpoint) {
      console.log(`User ${userId} has no active push subscription.`);
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
    });

    const subscription = {
      endpoint: user.pushSubscription.endpoint,
      keys: {
        p256dh: user.pushSubscription.keys.p256dh,
        auth: user.pushSubscription.keys.auth
      }
    };

    await webpush.sendNotification(subscription, payload);
    console.log(`Notification sent to ${userId}`);
    
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log("Subscription expired, removing from DB.");
      await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: "" } });
    } else {
      console.error("Push Error:", error);
    }
  }
}