/*开发者自行实现获取用户头像的逻辑*/
export async function getAvatarsByUsernames(
  usernames: string[],
): Promise<Map<string, string | null>> {
  const avatarMap = new Map<string, string | null>();
  usernames.forEach(item=>{
    avatarMap.set(item, null)
  })
  return new Promise((resolve) => {
    resolve(avatarMap)
  })
}
