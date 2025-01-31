"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabase";
import { addFavoriteFacility } from "../components/addFavoriteFacility";
import useStore from '@/store';

interface FacilityDetailsProps {
  id: string;
}

const FacilityDetails: React.FC<FacilityDetailsProps> = ({ id }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { user } = useStore();

  useEffect(() => {
    async function fetchTask() {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", id)
          .single(); // 指定されたIDのタスクを一つだけ取得

        if (error) {
          throw error;
        }

        setTask(data);

        // タスクが取得された後に画像を取得
        const { data: imageData, error: imageError } = await supabase.storage
          .from("saunaapp") // バケット名
          .getPublicUrl(`main/${id}.jpg`); // idからメイン画像を取得

        if (imageError) {
          throw imageError;
        }

        // 公開URLを設定
        setImageUrl(imageData.publicUrl);
      } catch (error) {
        console.error("Error fetching task or image:", error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTask();
  }, [id]);

  const handleAddFavorite = async () => {
    if (user?.id && id) {
      const success = await addFavoriteFacility(user.id, id);
      if (success) {
        alert("お気に入り登録が完了しました!");
      } 
    }
  };

  if (loading) {
    return <p className="text-center text-lg text-gray-600">読み込み中...</p>;
  }

  if (!task) {
    return <p className="text-center text-lg text-red-600">施設が見つかりませんでした。</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{task.text}</h1>
          {imageUrl && <img src={imageUrl} alt="Image" className="w-full h-48 object-cover rounded-md mb-4" />}
          <h1 className="text-4xl font-extrabold mb-4">{task.name}</h1>
          <ul className="space-y-2">
            <li><strong>営業時間:</strong> {task.openinghours}</li>
            <li><strong>アクセス:</strong> {task.access}</li>
            <li><strong>周辺の学校:</strong> {task.school}</li>
            <li><strong>料金:</strong> {task.fee}円</li>
            <li><strong>サウナ室温度:</strong> {task.saunatemperature}</li>
            <li><strong>水風呂温度:</strong> {task.watertemperature}</li>
            <li><strong>詳細:</strong> {task.details}</li>
            <li><strong>公式HP:</strong> <a href={task.HP} className="text-blue-600 hover:underline">{task.HP}</a></li>
          </ul>
          <div className="flex space-x-4 mt-2">
          <button
            onClick={handleAddFavorite}
            className="mt-4 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            お気に入り登録
          </button>
          <button
            className="mt-4 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            お気に入り解除
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetails;
