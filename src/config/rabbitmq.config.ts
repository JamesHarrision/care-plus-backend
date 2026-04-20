import * as amqp from 'amqplib';

let connection: any = null;
let channel: any = null;

export const connectRabbitMQ = async () => {
  try {
    const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    connection = await amqp.connect(amqpUrl);

    connection.on('close', () => {
      console.warn('[RabbitMQ] Connection is closed, retrying in 5s...');
      setTimeout(connectRabbitMQ, 5000);
    });

    if (connection) {
      channel = await connection.createChannel();

      // Khai báo 2 queue
      if (channel) {
        await channel.assertQueue('notifications.family', { durable: true });
        await channel.assertQueue('notifications.medication', { durable: true });
      }
    }

    console.log('✅ Kết nối RabbitMQ thành công và đã cấu hình queues.');
  } catch (error) {
    console.error('❌ Lỗi kết nối RabbitMQ:', error);
    console.warn('[RabbitMQ] Connection error, retrying in 5s...');
    setTimeout(connectRabbitMQ, 5000); // Retry after 5s [1, 11]
  }
};

export const getChannel = (): any => {
  if (!channel) {
    throw new Error('RabbitMQ channel chưa được khởi tạo!');
  }
  return channel;
};
