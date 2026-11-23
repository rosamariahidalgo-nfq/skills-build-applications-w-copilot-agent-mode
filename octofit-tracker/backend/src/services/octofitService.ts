import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') throw badRequest('Valid activity data is required');

  const { userId, teamId, type, minutes } = input as {
    userId?: unknown;
    teamId?: unknown;
    type?: unknown;
    minutes?: unknown;
  };

  if (
    typeof userId !== 'string'
    || typeof teamId !== 'string'
    || typeof type !== 'string'
    || !type.trim()
    || typeof minutes !== 'number'
    || !Number.isFinite(minutes)
    || minutes <= 0
  ) {
    throw badRequest('Valid activity data is required');
  }

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(teamId)) {
    throw badRequest('Activity references must be valid IDs');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user || !team) throw badRequest('Activity references must identify existing records');

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') throw badRequest('Valid team data is required');

  const { name, mascot, members } = input as {
    name?: unknown;
    mascot?: unknown;
    members?: unknown;
  };

  if (typeof name !== 'string' || !name.trim()) {
    throw badRequest('Team name is required');
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw badRequest('Team mascot is required');
  }

  const memberIds = members === undefined ? [] : members;
  if (!Array.isArray(memberIds) || memberIds.some((memberId) => typeof memberId !== 'string')) {
    throw badRequest('Team members must be an array of valid IDs');
  }

  if (memberIds.some((memberId) => !mongoose.Types.ObjectId.isValid(memberId))) {
    throw badRequest('Team members must be valid IDs');
  }

  if (memberIds.length > 0) {
    const existingMembers = await User.find({ _id: { $in: memberIds } }).select('_id').lean();
    if (existingMembers.length !== new Set(memberIds).size) {
      throw badRequest('Team members must identify existing users');
    }
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: memberIds,
  });

  if (memberIds.length > 0) {
    await User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } });
  }
  return team.toObject();
}

export async function getLeaderboard() {
  const [teams, activities] = await Promise.all([
    Team.find().lean(),
    Activity.find().lean(),
  ]);

  const pointsByTeam = new Map<string, number>();
  for (const activity of activities) {
    const teamId = activity.team?.toString();
    if (!teamId) continue;
    pointsByTeam.set(teamId, (pointsByTeam.get(teamId) ?? 0) + activity.points);
  }

  const ranked = teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return ranked;
}

export async function suggestWorkouts(userEmail: string) {
  if (typeof userEmail !== 'string' || !userEmail.trim()) {
    throw badRequest('A valid user email is required');
  }

  const user = await User.findOne({ email: userEmail.trim() }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .lean();

  const activityType = recentActivities[0]?.type?.toLowerCase() ?? '';
  let focus = String(user.fitnessGoal ?? '').toLowerCase();
  if (!focus) {
    if (/strength|lift|weight/.test(activityType)) focus = 'strength';
    else if (/mobility|yoga|stretch/.test(activityType)) focus = 'mobility';
    else if (/run|walk|cycle|swim|endurance/.test(activityType)) focus = 'endurance';
  }
  if (activityType === 'strength' && (!focus || focus === 'mobility')) focus = 'strength';
  if ((activityType === 'run' || activityType === 'cycle' || activityType === 'walk') && (!focus || focus === 'mobility')) {
    focus = 'endurance';
  }

  const workouts = await Workout.find(focus ? { focus } : {}).lean();
  const fallbackWorkouts = workouts.length > 0 ? workouts : await Workout.find().lean();

  return fallbackWorkouts.map((workout) => ({
    ...workout,
    reason: recentActivities[0]
      ? `Matches your ${workout.focus} goal after recent ${recentActivities[0].type} activity`
      : `Matches your ${workout.focus} fitness goal`,
  }));
}

export { User };
