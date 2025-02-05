import prisma from "../../../lib/prismadb";
import { builder } from "../../builder";
import { LeaveType } from "./enum";
import moment from "moment";

builder.mutationFields((t) => ({
  AddLeave: t.prismaField({
    type: "Leave",
    args: {
      type: t.arg({ type: LeaveType, required: true }),
      startDate: t.arg.string({ required: true }),
      endDate: t.arg.string({ required: true }),
      daysRequested: t.arg.float({ required: true }),
      requestedBy: t.arg.string({ required: true }),
      requesterNote: t.arg.string({}),
      requesterEmail: t.arg.string({ required: true }),
    },
    resolve: async (query, _, args, context) => {
      // if (!(await context).user) {
      //   throw new Error("You have to be logged in to perform this action");
      // }

      //TODO: Verify if the DB time when saving arequest is correct
      const changeStartDate = args.startDate;
      const startDateObject = new Date(changeStartDate);
      // const formattedStartDate = startDateObject.toISOString();
      const formattedStartDate = moment(startDateObject).format();

      const changeEndDate = args.endDate;
      const endDateObject = new Date(changeEndDate);
      const formattedEndDate = moment(endDateObject).format();

      //TODO : write a function to Verify User Here and reject request if same user is requesting same date

      // Check if user has already requested leave for the same dates
      const VerifyUser = await prisma.leave.findFirst({
        ...query,
        where: {
          requesterEmail: args.requesterEmail,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });

      if (VerifyUser) {
        throw new Error("You have already requested leave for these dates");
      }

      const newRequest = await prisma.leave.create({
        data: {
          ...args,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });

      return newRequest;
    },
  }),

  EditLeave: t.prismaField({
    type: "Leave",
    args: {
      id: t.arg.string({ required: true }),
      approved: t.arg.boolean({}),
      rejected: t.arg.boolean({}),
      moderatedBy: t.arg.string({ required: true }),
      moderatorNote: t.arg.string({}),
    },
    resolve: async (query, _, args, context) => {
      // if ((await context).user?.role !== "ADMIN") {
      //   throw new Error("You are not authorized to perform this action");
      // }
      const newLeave = await prisma.leave.update({
        where: { id: args.id },
        data: { ...args },
      });

      return newLeave;
    },
  }),
}));
