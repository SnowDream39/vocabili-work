import axios from "axios";
import type { SongInfo, VideoInfo } from "@/utils/types";

const BASE_URL = "https://api.vocabili.top/v2"

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

class Requester {
  static endpoint = {
    uploadFile: "/upload",
    checkFile: "/update/check_ranking",
    updateRanking: "/update/ranking",
    updateSnapshot: "/update/snapshots",
    editArtistCheck: "/edit/artist/check",
    editArtistConfirm: "/edit/artist/confirm",
    editSong: "/edit/song",
    editVideo: "/edit/video",
    search: (type: string) => `/search/${type}`,
    selectArtist: `/select/artist`,
    selectSong: `/select/song`,
    selectVideo: `/select/video`,
  }

  constructor() {}

  async uploadFile(
    file: File,
    handlers: {
      onProgress?: (progress: number) => void;
      onComplete?: () => void;
      onError?: (error: any) => void;
    }) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(Requester.endpoint.uploadFile, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (evt) => {
        if (evt.lengthComputable) {
          const progress = evt.loaded / evt.total!;
          handlers?.onProgress?.(progress);
          if (progress == 1) {
            handlers?.onComplete?.();
          }
        }
      },
    });
  }

  async checkFile(board: string, part: string, issue: number) {
    const res = await api.get(Requester.endpoint.checkFile, {
      params: { board, part, issue, },
    });
    return res.data;
  }

  updateRanking(
    board: string,
    part: string,
    issue: number,
    old?: boolean,
    handlers?: {
      onStart?: () => void;
      onProgress?: (data: string) => void;
      onComplete?: (data?: string) => void;
      onError?: (err: Event) => void;
    }
  ) {
    const es = new EventSource(
      `${BASE_URL}/${Requester.endpoint.updateRanking}?board=${board}&part=${part}&issue=${issue}${old ? '&old=true' : ''}`
    );

    handlers?.onStart?.();

    es.addEventListener("progress", e => {
      handlers?.onProgress?.(e.data);
    });

    es.addEventListener("complete", e => {
      handlers?.onComplete?.(e.data);
      es.close(); // ⭐由业务事件关闭
    });

    es.onerror = e => {
      // ⚠️ 不一定是错误，可能是正常关闭
      if (es.readyState !== EventSource.CLOSED) {
        handlers?.onError?.(e);
      }
    };

    return () => es.close(); // 返回一个取消函数
  }


  async updateSnapshot(date: string, old?: boolean) {
    const res = await api.get(Requester.endpoint.updateSnapshot, {
      params: { date, old },
      timeout: 100000, // 100秒超时
    });
    return res.data;
  }


  async editArtistCheck(type: string, id: number, name: string) {
    const res = await api.post(Requester.endpoint.editArtistCheck, { type, id, name });
    return res.data
  }

  async editArtistConfirm(task_id: string) {
    return api.post(Requester.endpoint.editArtistConfirm, { task_id });
  }

  async search(type: string, keyword: string, page = 1, pageSize = 20): Promise<any> {
    // TODO
    const res =  await api.get(Requester.endpoint.search(type), {
      params: { keyword, page, page_size: pageSize }
    })
    return res.data
  }

  async selectArtist(type: string, id: number) {
    const res = await api.get(Requester.endpoint.selectArtist, {
      params: { type, id }
    });
    return res.data
  }

  async selectSong(id: number): Promise<{data: SongInfo}> {
    const res = await api.get(Requester.endpoint.selectSong, {
      params: { id }
    });
    return res.data
  }

  async editSong(song: SongInfo) {
    const res = await api.post(Requester.endpoint.editSong, song);
    return res.data
  }

  async selectVideo(bvid: string): Promise<{data: VideoInfo}> {
    const res = await api.get(Requester.endpoint.selectVideo, {
      params: { bvid }
    });
    return res.data
  }

  async editVideo(video: VideoInfo) {
    const res = await api.post(Requester.endpoint.editVideo, video);
    return res.data
  }
}

export default new Requester();
