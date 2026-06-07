export interface Avatar {
  id: string;
  name: string;
  gender: "male" | "female";
  image: string;
}

const face = (n: number) => `https://i.pravatar.cc/400?img=${n}`;

/** Mock influencer/avatar roster for the "اختر الشخصية" picker. */
export const AVATARS: Avatar[] = [
  { id: "laila", name: "ليلى", gender: "female", image: face(45) },
  { id: "omar", name: "عمر طارق", gender: "male", image: face(12) },
  { id: "salma", name: "سلمى", gender: "female", image: face(47) },
  { id: "youssef", name: "يوسف", gender: "male", image: face(13) },
  { id: "nadia", name: "نادية", gender: "female", image: face(44) },
  { id: "ahmed", name: "أحمد", gender: "male", image: face(11) },
  { id: "faisal", name: "فيصل", gender: "male", image: face(51) },
  { id: "noura", name: "نورة", gender: "female", image: face(49) },
  { id: "reem", name: "ريم", gender: "female", image: face(32) },
  { id: "khaled", name: "خالد", gender: "male", image: face(33) },
  { id: "jana", name: "جنى", gender: "female", image: face(48) },
  { id: "saad", name: "سعد", gender: "male", image: face(14) },
];
