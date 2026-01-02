import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { create } from 'zustand';
import { useForm, Controller } from 'react-hook-form';

import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import {
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { t } from 'src/i18n';
import { db } from 'src/database/dexie';

import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { DatePickerField } from 'src/components/fields/date-picker-field';

import { cancelNotification } from '../utils/save-notification';

export const useDialogDeleteSchedule = create<DialogProps>((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),
}));

type DeleteFormValues = {
    fromDate: Dayjs;
    toDate: Dayjs;
    fromTime: Dayjs;
    toTime: Dayjs;
};

export function DialogDeleteSchedule() {
    const { open, setOpen } = useDialogDeleteSchedule();
    const router = useRouter();
    const { control, handleSubmit, watch } = useForm<DeleteFormValues>({
        defaultValues: {
            fromDate: dayjs(),
            toDate: dayjs().add(7, 'day'),
            fromTime: dayjs().hour(20).minute(0),
            toTime: dayjs().hour(22).minute(0),
        },
    });

    const fromDate = watch('fromDate');
    const fromTime = watch('fromTime');

    const handleDelete = handleSubmit(async (data) => {
        const start = data.fromDate.startOf('day');
        const end = data.toDate.endOf('day');

        const fromTotalMinutes = data.fromTime.hour() * 60 + data.fromTime.minute();
        const toTotalMinutes = data.toTime.hour() * 60 + data.toTime.minute();

        dialog.delete(
            t('Do you really want to delete all schedules from {{from}} to {{to}} between {{timeStart}} and {{timeEnd}}?', {
                from: start.format('DD/MM/YYYY'),
                to: end.format('DD/MM/YYYY'),
                timeStart: data.fromTime.format('HH:mm'),
                timeEnd: data.toTime.format('HH:mm'),
            }),
            async () => {
                try {
                    const schedulesToDelete = await db.schedules
                        .filter((s) => {
                            const d = dayjs(s.timeHandle);
                            const targetTotalMinutes = d.hour() * 60 + d.minute();
                            return (
                                d.isSameOrAfter(start) &&
                                d.isSameOrBefore(end) &&
                                targetTotalMinutes >= fromTotalMinutes &&
                                targetTotalMinutes <= toTotalMinutes
                            );
                        })
                        .toArray();

                    if (schedulesToDelete.length === 0) {
                        toast.warning(t('No schedules found to delete'));
                        return;
                    }

                    const ids = schedulesToDelete.map((s) => s.id!);

                    // Cancel notifications
                    for (const id of ids) {
                        await cancelNotification(id);
                    }

                    // Delete from DB
                    await db.schedules.bulkDelete(ids);

                    toast.success(t('Deleted {{count}} schedules successfully', { count: ids.length }));
                    setOpen(false);
                    router.refresh();
                } catch (error) {
                    console.error(error);
                    toast.error(t('Failed to delete schedules'));
                }
            }
        );
    });

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
            <DialogTitle>{t('Delete schedules in batch')}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Controller
                        control={control}
                        name="fromDate"
                        render={({ field }) => (
                            <DatePickerField
                                {...field}
                                label={t('From date')}
                                enableAccessibleFieldDOMStructure={false}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="toDate"
                        rules={{
                            validate: (value) =>
                                !value.isBefore(fromDate, 'day') || t('To date must be after or same as From date'),
                        }}
                        render={({ field, fieldState: { error, invalid } }) => (
                            <DatePickerField
                                {...field}
                                label={t('To date')}
                                minDate={fromDate}
                                error={invalid}
                                helperText={error?.message}
                                enableAccessibleFieldDOMStructure={false}
                            />
                        )}
                    />
                    <Stack direction="row" spacing={2}>
                        <Controller
                            control={control}
                            name="fromTime"
                            render={({ field: { value, onChange, ...field } }) => (
                                <MobileTimePicker
                                    {...field}
                                    sx={{ flex: 1 }}
                                    label={t('From time')}
                                    value={value || null}
                                    onChange={(v) => onChange(v ?? dayjs().hour(0).minute(0))}
                                    ampm={false}
                                    enableAccessibleFieldDOMStructure={false}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="toTime"
                            rules={{
                                validate: (value) => {
                                    const fromTotalMinutes = fromTime.hour() * 60 + fromTime.minute();
                                    const toTotalMinutes = value.hour() * 60 + value.minute();
                                    return toTotalMinutes >= fromTotalMinutes || t('To time must be after or same as From time');
                                }
                            }}
                            render={({ field: { value, onChange, ...field }, fieldState: { error, invalid } }) => (
                                <MobileTimePicker
                                    {...field}
                                    sx={{ flex: 1 }}
                                    label={t('To time')}
                                    value={value || null}
                                    minTime={fromTime}
                                    onChange={(v) => onChange(v ?? dayjs().hour(23).minute(59))}
                                    ampm={false}
                                    enableAccessibleFieldDOMStructure={false}
                                    slotProps={{
                                        textField: {
                                            error: invalid,
                                            helperText: error?.message,
                                        }
                                    }}
                                />
                            )}
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>{t('Close')}</Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={handleDelete}
                >
                    {t('Delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
