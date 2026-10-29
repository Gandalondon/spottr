import json, numpy as np
from scipy.optimize import least_squares
from dist import D
R={k:np.array(v,float) for k,v in json.load(open('returns.json')).items()}
FIX={"Ancient Fort":np.array([7025.,7501.]),"Barren Clearing":np.array([3695.,4528.])}
P=list(D); idx={p:i for i,p in enumerate(P)}
# initial: weighted centroid of return points
init=[]
for p in P:
    rs=D[p][1]; w=np.array([1/m for _,m in rs]); pts=np.array([R[n] for n,_ in rs])
    init.append((pts*w[:,None]).sum(0)/w.sum())
x0=np.concatenate([np.array(init).ravel(),[6.0]])
def res(x):
    pos=x[:-1].reshape(-1,2).copy(); s=x[-1]; out=[]
    for k,v in FIX.items(): pos[idx[k]]=v
    for p,(nb,rs,_) in D.items():
        a=pos[idx[p]]
        for n,m in nb: out.append((np.linalg.norm(a-pos[idx[n]])-s*m)/(s*max(m,40)) )
        for n,m in rs: out.append(2*(np.linalg.norm(a-R[n])-s*m)/(s*max(m,40)))
        y0,y1,x0_,x1=2688,7674,4557,9872; yy=(a[0]-y0)/(y1-y0); xx=(a[1]-x0_)/(x1-x0_)
        w=D[p][2]
        def band(v,lo,hi): return 0 if lo<=v<=hi else min(abs(v-lo),abs(v-hi))*20
        vy=(0,.42) if 'upper' in w else (.55,1) if 'lower' in w else (.3,.7) if w=='middle' else (0,1)
        vx=(0,.42) if 'left' in w else (.58,1) if 'right' in w else (.3,.7) if 'middle' in w else (0,1)
        out.append(band(yy,*vy)); out.append(band(xx,*vx))
    return out
r=least_squares(res,x0)
pos=r.x[:-1].reshape(-1,2); s=r.x[-1]
for k,v in FIX.items(): pos[idx[k]]=v
print("units per m %.2f, cost %.3f"%(s,r.cost))
# error check: return distances
out={}
for p in P:
    a=pos[idx[p]]; errs=[abs(np.linalg.norm(a-R[n])/s-m) for n,m in D[p][1]]
    out[p]=[int(a[0]),int(a[1])]
    print(f"{p:28s} y={a[0]:6.0f} x={a[1]:6.0f}  {D[p][2]:13s} return err m: {[int(e) for e in errs]}")
json.dump({"unitsPerMetre":s,"places":out},open('fitted.json','w'))
