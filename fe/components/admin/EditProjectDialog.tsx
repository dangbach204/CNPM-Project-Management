import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/types/admin";
import { ProjectStatus, PROJECT_STATUS_OPTIONS } from "@/types/status";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: number;
  fullName?: string;
  full_name?: string;
  email: string;
  avatar?: string;
}

interface Teacher {
  id: number;
  fullName?: string;
  full_name?: string;
  email: string;
}

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    projectId: number,
    data: {
      title: string;
      description: string;
      teacherId: string | number;
      status: string;
      expiredAt: string | Date;
      addStudents: number[];
      removeStudents: number[];
    }
  ) => Promise<void>;
  project: Project | null;
  loading?: boolean;
  teachers?: Teacher[];
  allStudents?: Student[];
  allProjects?: Project[];
}

const getFullName = (item: Teacher | Student) =>
  item.fullName || (item as any).full_name || "Không có tên";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export function EditProjectDialog({
  open,
  onClose,
  onSave,
  project,
  loading = false,
  teachers = [],
  allStudents = [],
  allProjects = [],
}: EditProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [status, setStatus] = useState<ProjectStatus>("pending");
  const [expiredAt, setExpiredAt] = useState("");

  const [projectStudents, setProjectStudents] = useState<Student[]>([]);
  const [addedStudentIds, setAddedStudentIds] = useState<number[]>([]);
  const [removedStudentIds, setRemovedStudentIds] = useState<number[]>([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const [teacherOpen, setTeacherOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);

  useEffect(() => {
    if (!project || !open) return;

    setTitle(project.title || "");
    setDescription(project.description || "");
    setTeacherId(project.teacherId?.toString() || "");
    setStatus(project.status || "pending");
    setExpiredAt(formatDateForInput(project.expiredAt));
    setProjectStudents((project as any).students || []);
    setAddedStudentIds([]);
    setRemovedStudentIds([]);
    setShowStudentList(false);
    setSelectedStudentId("");
  }, [project, open]);

  const handleSave = async () => {
    if (!project) return;

    await onSave(project.id, {
      title,
      description,
      teacherId,
      status,
      expiredAt,
      addStudents: addedStudentIds,
      removeStudents: removedStudentIds,
    });
  };

  const handleAddStudent = () => {
    if (!selectedStudentId) return;

    const studentId = parseInt(selectedStudentId);
    const student = allStudents.find((s) => s.id === studentId);

    if (!student || projectStudents.some((s) => s.id === studentId)) return;

    setProjectStudents((prev) => [...prev, student]);
    setRemovedStudentIds((prev) => prev.filter((id) => id !== studentId));
    setAddedStudentIds((prev) =>
      removedStudentIds.includes(studentId) ? prev : [...prev, studentId]
    );
    setSelectedStudentId("");
  };

  const handleRemoveStudent = (studentId: number) => {
    setProjectStudents((prev) => prev.filter((s) => s.id !== studentId));
    setAddedStudentIds((prev) => prev.filter((id) => id !== studentId));
    setRemovedStudentIds((prev) =>
      addedStudentIds.includes(studentId) ? prev : [...prev, studentId]
    );
  };

  // Get all student IDs that are in other projects (not current project)
  const studentsInOtherProjects = new Set<number>();
  allProjects.forEach((proj) => {
    if (proj.id !== project?.id && (proj as any).students) {
      (proj as any).students.forEach((student: Student) => {
        studentsInOtherProjects.add(student.id);
      });
    }
  });

  // Filter out students already in current project or in other projects
  const availableStudents = allStudents.filter(
    (student) =>
      !projectStudents.some((ps) => ps.id === student.id) &&
      !studentsInOtherProjects.has(student.id)
  );

  const selectedTeacher = teachers.find((t) => t.id.toString() === teacherId);
  const selectedStudent = availableStudents.find(
    (s) => s.id.toString() === selectedStudentId
  );

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa đề tài</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto px-1">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tên đề tài</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên đề tài"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả đề tài"
              rows={4}
            />
          </div>

          {/* Teacher */}
          <div className="space-y-2">
            <Label htmlFor="teacher">Giảng viên hướng dẫn</Label>
            <Popover
              open={teacherOpen}
              onOpenChange={setTeacherOpen}
              modal={true}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={teacherOpen}
                  className="w-full justify-between"
                >
                  {selectedTeacher
                    ? `${getFullName(selectedTeacher)} - ${
                        selectedTeacher.email
                      }`
                    : "Chọn giảng viên"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
                sideOffset={5}
              >
                <Command shouldFilter={true}>
                  <CommandInput placeholder="Tìm theo tên hoặc email..." />
                  <CommandList className="max-h-[300px] overflow-y-auto rounded-r-xl">
                    <CommandEmpty>Không tìm thấy giảng viên.</CommandEmpty>
                    <CommandGroup>
                      {teachers.map((teacher) => (
                        <CommandItem
                          key={teacher.id}
                          value={`${getFullName(teacher)} ${teacher.email}`}
                          onSelect={() => {
                            setTeacherId(teacher.id.toString());
                            setTeacherOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              teacherId === teacher.id.toString()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {getFullName(teacher)} - {teacher.email}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as ProjectStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expired At */}
          <div className="space-y-2">
            <Label htmlFor="expiredAt">Ngày hết hạn</Label>
            <Input
              id="expiredAt"
              type="date"
              value={expiredAt}
              onChange={(e) => setExpiredAt(e.target.value)}
            />
          </div>

          <Separator />

          {/* Student Management Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <Label className="text-base">
                  Sinh viên ({projectStudents.length})
                </Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowStudentList(!showStudentList)}
              >
                {showStudentList ? "Ẩn danh sách" : "Xem danh sách"}
              </Button>
            </div>

            {showStudentList && (
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                {/* Add Student */}
                <div className="flex gap-2">
                  <Popover
                    open={studentOpen}
                    onOpenChange={setStudentOpen}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={studentOpen}
                        className="flex-1 justify-between"
                      >
                        {selectedStudent
                          ? `${getFullName(selectedStudent)} - ${
                              selectedStudent.email
                            }`
                          : "Chọn sinh viên để thêm"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start"
                      sideOffset={5}
                    >
                      <Command shouldFilter={true}>
                        <CommandInput placeholder="Tìm theo tên hoặc email..." />
                        <CommandList className="max-h-[300px] overflow-y-auto rounded-r-xl">
                          <CommandEmpty>
                            {availableStudents.length === 0
                              ? "Không có sinh viên khả dụng (tất cả đã tham gia project khác)"
                              : "Không tìm thấy sinh viên."}
                          </CommandEmpty>
                          <CommandGroup>
                            {availableStudents.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={`${getFullName(student)} ${
                                  student.email
                                }`}
                                onSelect={() => {
                                  setSelectedStudentId(student.id.toString());
                                  setStudentOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedStudentId === student.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {getFullName(student)} - {student.email}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddStudent}
                    disabled={!selectedStudentId}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                </div>

                <Separator />

                {/* Student List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {projectStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Chưa có sinh viên nào
                    </p>
                  ) : (
                    projectStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-background"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {getInitials(getFullName(student))}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {getFullName(student)}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {student.email}
                          </p>
                        </div>

                        {addedStudentIds.includes(student.id) && (
                          <Badge variant="secondary" className="text-xs">
                            Mới thêm
                          </Badge>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
