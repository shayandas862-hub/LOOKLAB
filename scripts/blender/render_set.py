# Renders one Blender ground-truth set from a plan written by scripts/blender/plan.ts (P3 task 3).
#   Blender --background --factory-startup --python scripts/blender/render_set.py -- <plan.json> <out_dir> [CPU|GPU]
# The head is built here from a sphere (no downloaded model, so no licence to record): nose, brow ridge, eye
# sockets, cheekbones, lips and chin are displacements of its front; eyes, brows, ears, hair, neck and shoulders
# are separate meshes. Every number that decides the truth comes from the plan; this script only builds it.
# Writes <id>.png for each scene and render-log.json (Blender version, device, seconds per scene, and the face
# box Blender itself projects, as a check on the planner's).
import json
import math
import os
import sys
import time

import bmesh
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
PLAN = json.load(open(argv[0]))
OUT = argv[1]
DEVICE = argv[2] if len(argv) > 2 else 'CPU'
HEAD = PLAN['head']
R = PLAN['render']
CX, CY, CZ = HEAD['centre']
A, B, C = HEAD['radii']


def smooth(e0, e1, x):
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def g2(x, z, cx, cz, sx, sz):
    return math.exp(-(((x - cx) / sx) ** 2 + ((z - cz) / sz) ** 2))


def face_offset(x, z):
    """How far (m) the face comes toward the camera at head-local (x, z), on top of the ellipsoid."""
    ax = abs(x)
    ridge = min(1.0, max(0.0, (0.032 - z) / 0.052)) ** 1.4
    nose = 0.026 * math.exp(-(x / 0.0105) ** 2) * ridge * (1.0 if z > -0.022 else math.exp(-((z + 0.022) / 0.007) ** 2))
    sockets = -0.011 * g2(ax, z, 0.032, 0.013, 0.016, 0.011)
    brow = 0.006 * math.exp(-((z - 0.035) / 0.008) ** 2) * math.exp(-(x / 0.05) ** 2)
    cheekbones = 0.006 * g2(ax, z, 0.045, -0.008, 0.018, 0.015)
    lips = 0.007 * g2(x, z, 0.0, -0.056, 0.022, 0.008)
    chin = 0.008 * g2(x, z, 0.0, -0.092, 0.02, 0.012)
    return nose + sockets + brow + cheekbones + lips + chin


def taper(z):
    """The jaw narrows below the cheekbones."""
    return 1 - 0.22 * smooth(-0.02, -C, z)


def front_weight(ny):
    return smooth(-0.15, -0.55, ny)


def surface_y(x, z):
    """Head-local y of the face's front surface at (x, z)."""
    nz = z / C
    nx = x / (A * taper(z))
    ny = -math.sqrt(max(0.0, 1 - nx * nx - nz * nz))
    return B * ny - face_offset(x, z) * front_weight(ny)


def material(name, rgb, rough, sss=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*rgb, 1)
    p.inputs['Roughness'].default_value = rough
    if sss:
        p.inputs['Subsurface Weight'].default_value = sss
        p.inputs['Subsurface Radius'].default_value = (1.0, 0.4, 0.2)
        p.inputs['Subsurface Scale'].default_value = 0.004
    return m


def mesh_object(name, bm, mat, smooth_shade=True, subsurf=0):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth_shade:
        for poly in me.polygons:
            poly.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(mat)
    if subsurf:
        mod = ob.modifiers.new('subsurf', 'SUBSURF')
        mod.levels = mod.render_levels = subsurf
    return ob


def ellipsoid(name, centre, radii, mat, segs=(48, 32), roll=0.0):
    """An ellipsoid built in place; `roll` turns it about its own depth axis (radians), for a brow's slant."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs[0], v_segments=segs[1], radius=1.0)
    cr, sr = math.cos(roll), math.sin(roll)
    for v in bm.verts:
        x, y, z = radii[0] * v.co.x, radii[1] * v.co.y, radii[2] * v.co.z
        v.co = Vector((centre[0] + cr * x + sr * z, centre[1] + y, centre[2] - sr * x + cr * z))
    return mesh_object(name, bm, mat)


def build_head(skin, hair, sclera, iris, cloth):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=128, v_segments=96, radius=1.0)
    for v in bm.verts:
        n = v.co.copy()
        z = C * n.z
        x = A * n.x * taper(z)
        y = B * n.y - face_offset(x, z) * front_weight(n.y)
        v.co = Vector((CX + x, CY + y, CZ + z))
    head = mesh_object('head', bm, skin, subsurf=1)

    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=64, radius=1.0)
    drop = [v for v in bm.verts if not (v.co.z > 0.47 or (v.co.y > -0.25 and v.co.z > 0.1) or (v.co.y > 0.2 and v.co.z > -0.55))]
    bmesh.ops.delete(bm, geom=drop, context='VERTS')
    for v in bm.verts:
        v.co = Vector((CX + 0.079 * v.co.x, CY + 0.1 * v.co.y, CZ + 0.121 * v.co.z))
    mesh_object('hair', bm, hair, subsurf=1)

    for s in (-1, 1):
        ex, ez = 0.032 * s, 0.013
        ey = surface_y(ex, ez) + 0.0085
        ellipsoid(f'eye{s}', (CX + ex, CY + ey, CZ + ez), (0.0115,) * 3, sclera, (32, 16))
        ellipsoid(f'iris{s}', (CX + ex, CY + ey - 0.0075, CZ + ez), (0.0058,) * 3, iris, (24, 12))
        bx, bz = 0.03 * s, 0.031
        ellipsoid(f'brow{s}', (CX + bx, CY + surface_y(bx, bz) - 0.0005, CZ + bz), (0.018, 0.004, 0.0035), hair, (24, 12), roll=s * math.radians(8))
        ellipsoid(f'ear{s}', (CX + 0.073 * s, CY + 0.008, CZ), (0.01, 0.017, 0.028), skin, (24, 16))

    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=48, radius1=0.056, radius2=0.052, depth=0.16)
    for v in bm.verts:
        v.co = Vector((CX + v.co.x, CY + 0.015 + v.co.y, CZ - 0.13 + v.co.z))
    mesh_object('neck', bm, skin)
    ellipsoid('torso', (CX, CY + 0.035, CZ - 0.34), (0.22, 0.12, 0.17), cloth, (64, 32))
    return head


def check_parts():
    """B-LL-003 guard: every part of the head sits on the head (0.13 m of its centre; neck and torso 0.45 m)."""
    centre = Vector((CX, CY, CZ))
    bpy.context.view_layer.update()  # matrix_world is stale until the scene updates
    for ob in bpy.data.objects:
        if ob.type != 'MESH' or ob.name == 'Plane':
            continue
        corners = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
        mid = sum(corners, Vector()) / 8
        limit = 0.45 if ob.name in ('neck', 'torso') else 0.13
        if (mid - centre).length > limit:
            raise SystemExit(f'render_set.py: {ob.name} is {(mid - centre).length:.3f} m from the head centre (limit {limit} m); not rendering')


def disk_light(name):
    data = bpy.data.lights.new(name, 'AREA')
    data.shape = 'DISK'
    ob = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(ob)
    ob.visible_camera = False
    return ob


def place_light(ob, setup):
    ob.location = Vector(setup['position'])
    ob.rotation_euler = (Vector(setup['aim']) - ob.location).to_track_quat('-Z', 'Y').to_euler()
    ob.data.size = max(setup['size_m'], 0.005)
    ob.data.color = setup['color']
    ob.data.energy = setup['power_w']


def wall_material():
    m = bpy.data.materials.new('wall')
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    p.inputs['Roughness'].default_value = 0.9
    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 6.0
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    nt.links.new(noise.outputs['Fac'], mix.inputs['Factor'])
    nt.links.new(mix.outputs['Result'], p.inputs['Base Color'])
    return m, mix


def set_wall(mix, rgb, mottled):
    lo, hi = (0.55, 1.45) if mottled else (1.0, 1.0)
    mix.inputs['A'].default_value = (*[c * lo for c in rgb], 1)
    mix.inputs['B'].default_value = (*[c * hi for c in rgb], 1)


def face_box_from_blender(scene, cam, head):
    """The projected box of the head's front vertices between chin and hairline, as frame fractions."""
    dg = bpy.context.evaluated_depsgraph_get()
    me = head.evaluated_get(dg).to_mesh()
    top = CZ + HEAD['hairline'][2]
    bottom = CZ + HEAD['chin'][2]
    xs, ys = [], []
    for v in me.vertices:
        w = head.matrix_world @ v.co
        if bottom <= w.z <= top and w.y < CY - 0.005:
            p = world_to_camera_view(scene, cam, w)
            xs.append(p.x)
            ys.append(1 - p.y)
    head.evaluated_get(dg).to_mesh_clear()
    return {'x': min(xs), 'y': min(ys), 'w': max(xs) - min(xs), 'h': max(ys) - min(ys)}


def main():
    scene = bpy.context.scene
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob)
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = R['samples']
    scene.cycles.use_denoising = R['denoise']
    scene.cycles.seed = 0
    if DEVICE == 'GPU':
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        scene.cycles.device = 'GPU'
    scene.render.resolution_x, scene.render.resolution_y = R['width'], R['height']
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.view_settings.view_transform = R['view_transform']
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.image_settings.color_depth = '8'
    world = bpy.data.worlds.new('world')
    world.use_nodes = True
    scene.world = world
    bg = world.node_tree.nodes['Background']

    skin = material('skin', (0.5, 0.3, 0.2), 0.45, sss=0.12)
    hair = material('hair', (0.02, 0.014, 0.01), 0.55)
    sclera = material('sclera', (0.55, 0.52, 0.5), 0.2)
    iris = material('iris', (0.03, 0.015, 0.008), 0.1)
    cloth = material('cloth', (0.05, 0.05, 0.05), 0.85)
    head = build_head(skin, hair, sclera, iris, cloth)
    check_parts()

    bpy.ops.mesh.primitive_plane_add(size=8)
    wall = bpy.context.active_object
    wall.rotation_euler = (math.radians(90), 0, 0)
    wmat, wmix = wall_material()
    wall.data.materials.append(wmat)

    key, fill = disk_light('key'), disk_light('fill')
    cam_data = bpy.data.cameras.new('camera')
    cam_data.sensor_fit = 'HORIZONTAL'
    cam_data.sensor_width = R['sensor_mm']
    cam = bpy.data.objects.new('camera', cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.rotation_euler = (math.radians(90), 0, 0)

    log = {'blender': bpy.app.version_string, 'device': DEVICE, 'scenes': []}
    for s in PLAN['scenes']:
        t0 = time.time()
        b = s['blender']
        skin.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*b['skin'], 1)
        cloth.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*b['clothes'], 1)
        place_light(key, b['key'])
        place_light(fill, b['fill'])
        cam_data.lens = s['camera']['focal_mm']
        cam_data.shift_x = s['camera']['shift_x']
        cam_data.shift_y = s['camera']['shift_y']
        cam.location = Vector(s['camera']['position'])
        wall.location = Vector((CX, CY + s['wall_distance_m'], CZ))
        if b['wall'] is None:
            wall.hide_render = True
            bg.inputs['Color'].default_value = (0.002, 0.002, 0.002, 1)
        else:
            wall.hide_render = False
            set_wall(wmix, b['wall'], s['background'] == 'mottled')
            bg.inputs['Color'].default_value = (0.02, 0.02, 0.02, 1)
        scene.render.filepath = os.path.join(OUT, s['id'] + '.png')
        bpy.ops.render.render(write_still=True)
        log['scenes'].append({'id': s['id'], 'seconds': round(time.time() - t0, 2),
                              'face_box_blender': {k: round(v, 4) for k, v in face_box_from_blender(scene, cam, head).items()}})
        print(f"rendered {s['id']} in {time.time() - t0:.1f} s", flush=True)
    with open(os.path.join(OUT, 'render-log.json'), 'w') as f:
        json.dump(log, f, indent=2)


main()
