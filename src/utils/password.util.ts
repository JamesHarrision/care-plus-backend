import bcrypt from 'bcrypt'

const SALT = 10;

export const passwordUtil = {
  async hashPassword(password: string): Promise<string>{
    return await bcrypt.hash(password, SALT);
  },

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}