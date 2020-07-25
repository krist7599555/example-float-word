import BADWORDS from './data/badwords.json';
import BADWORDS_DETAIL from './data/badwords_detail.json';

export async function request_badwords() {
  return BADWORDS;
}
export async function request_badword_detail(id: string) {
  return BADWORDS_DETAIL;
}