
import bcrypt from "bcrypt";

async function hash(value:string) {
    const salt=await bcrypt.genSalt(10,"a")
    const hashedValue=bcrypt.hash(value,salt)
    return hashedValue
}

async function compare(decodedValue:string,encyptedValue:string) {
  const comparedValue= bcrypt.compareSync(decodedValue,encyptedValue) 
  return comparedValue
}

export {hash,compare}