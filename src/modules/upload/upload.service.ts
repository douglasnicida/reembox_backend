import { Injectable } from '@nestjs/common';
import { UploadDTO } from './dto/upload.dto';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {

  async upload(file: UploadDTO) {

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
      auth: {
        persistSession: false // ter melhor gerenciamento da conexão com o supabase
      }
    })

    const { error } = await supabase.storage.from('receipts').upload(file.originalname, file.buffer, {
      upsert: true // se já existir um arquivo com esse nome, ele atualiza e sobrepõe
    })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // gerando url do arquivo após seu upload
    const { data } = supabase.storage.from('receipts').getPublicUrl(file.originalname);

    return data.publicUrl;
  }

}
