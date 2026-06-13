


const roomIdGenerator = ({senderId,receiverId}:{senderId:string,receiverId:string}) => {
 return [senderId,receiverId].sort().join("_")
}

export default roomIdGenerator