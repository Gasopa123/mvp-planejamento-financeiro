export function booleano(formData: FormData, key: string) {
  return formData.getAll(key).includes("on");
}
