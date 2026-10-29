from pathlib import Path
import os,sys,subprocess,json
work=Path(sys.argv[1]).resolve();scripts=work/'scenario-kinetic-film/scripts'
sys.path.insert(0,str(scripts));from filmserver import serve
url,server=serve(work/'film')
try:
 env=os.environ.copy();env['FILM_URL']=url;env['GRAIN']='0';env['ENC']='-c:v libx264 -crf 18 -preset fast -threads 2'
 subprocess.run([sys.executable,str(scripts/'post.py'),'1','0','1965',str(work/'motion.mp4'),'30'],env=env,check=True)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,nb_read_frames,r_frame_rate','-of','json',str(work/'motion.mp4')]))['streams'][0]
 assert (probe['width'],probe['height'],probe['nb_read_frames'],probe['r_frame_rate'])==(1920,1080,'1965','30/1'),probe
 subprocess.run(['ffmpeg','-v','error','-i',str(work/'motion.mp4'),'-f','null','-'],check=True)
finally:server.shutdown();server.server_close()
