import axios from "axios";
import type { Ref } from "vue";



const api = axios.create({
  baseURL: "https://api.vocabili.top/v2",
  timeout: 20000,
});

class Requester {
  static endpoint = {
    uploadFile: "/upload",
    checkFile: "/update/check_ranking",
    updateRanking: "/update/ranking",
    editArtistCheck: "/edit/artist/check",
    editArtistConfirm: "/edit/artist/confirm",
  }

  constructor() {}

  async uploadFile(file: File, progressRef: Ref<number, number>) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(Requester.endpoint.uploadFile, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (evt) => {
        if (evt.lengthComputable) {
          progressRef.value = Math.round((evt.loaded * 100) / evt.total!)
        }
      },
    });
  }

  async checkFile(board: string, part: string, issue: number) {
    const res = await api.get(Requester.endpoint.checkFile, {
      params: {
        board,
        part,
        issue,
      },
    });
    return res.data;
  }

  async updateRanking(board: string, part: string, issue: number, old?: boolean) {
    const res = await api.get(Requester.endpoint.updateRanking, {
      params: {
        board,
        part,
        issue,
        old
      },
    });
    return res.data;
  }

  async editArtistCheck(type: string, id: number, name: string) {
    const res = await api.post(Requester.endpoint.editArtistCheck, {
      type,
      id,
      name
    });
    return res.data
  }

  async editArtistConfirm(task_id: string) {
    return api.post(Requester.endpoint.editArtistConfirm, {
      task_id
    });
  }
}

export default new Requester();
