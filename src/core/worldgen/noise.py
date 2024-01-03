import random
import math

PERLIN_YWRAPB = 4
PERLIN_YWRAP = 1 << PERLIN_YWRAPB
PERLIN_ZWRAPB = 8
PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB
PERLIN_SIZE = 4095

perlin_octaves = 4
perlin_amp_falloff = 0.5

def scaled_cosine(i):
    return 0.5 * (1.0 - math.cos(i * math.pi))

perlin = None

def noise(x, y=0, z=0):
    global perlin

    if perlin is None:
        perlin = [random.random() for _ in range(PERLIN_SIZE + 1)]

    if x < 0:
        x = -x
    if y < 0:
        y = -y
    if z < 0:
        z = -z

    xi = int(x)
    yi = int(y)
    zi = int(z)
    xf = x - xi
    yf = y - yi
    zf = z - zi
    rxf, ryf = 0, 0

    r = 0
    ampl = 0.5

    for o in range(perlin_octaves):
        of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB)

        rxf = scaled_cosine(xf)
        ryf = scaled_cosine(yf)

        n1 = perlin[of & PERLIN_SIZE]
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1)
        n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE]
        n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2)
        n1 += ryf * (n2 - n1)

        of += PERLIN_ZWRAP
        n2 = perlin[of & PERLIN_SIZE]
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2)
        n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE]
        n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3)
        n2 += ryf * (n3 - n2)

        n1 += scaled_cosine(zf) * (n2 - n1)

        r += n1 * ampl
        ampl *= perlin_amp_falloff
        xi <<= 1
        xf *= 2
        yi <<= 1
        yf *= 2
        zi <<= 1
        zf *= 2

        if xf >= 1.0:
            xi += 1
            xf -= 1.0
        if yf >= 1.0:
            yi += 1
            yf -= 1.0
        if zf >= 1.0:
            zi += 1
            zf -= 1.0

    return r

def noiseDetail(lod, falloff):
    global perlin_octaves, perlin_amp_falloff

    if lod > 0:
        perlin_octaves = lod
    if falloff > 0:
        perlin_amp_falloff = falloff

def noiseSeed(seed):
    global perlin

    def lcg():
        m = 4294967296
        a = 1664525
        c = 1013904223
        seed, z = 0, 0

        def setSeed(val):
            nonlocal seed, z
            z = seed = val if val is not None else random.random() * m
            z = int(z)  # Ensure z is an integer

        def getSeed():
            return seed

        def rand():
            nonlocal z
            z = (a * z + c) % m
            return z / m

        return setSeed, getSeed, rand

    setSeed, _, _ = lcg()
    setSeed(seed)
    perlin = [lcg()[2]() for _ in range(PERLIN_SIZE + 1)]

if __name__ == "__main__":
    # Example usage:
    print(noise(1.2, 3.4, 5.6))
    noiseDetail(8, 0.6)
    print(noise(1.2, 3.4, 5.6))
    noiseSeed(42)
    print(noise(1.2, 3.4, 5.6))
