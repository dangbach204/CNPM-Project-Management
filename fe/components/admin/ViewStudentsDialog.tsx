import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User } from "lucide-react";

interface Student {
  id: number;
  fullName?: string;
  full_name?: string;
  email: string;
  avatar?: string;
  studentId?: string;
  student_id?: string;
}

interface ViewStudentsDialogProps {
  open: boolean;
  onClose: () => void;
  projectTitle: string;
  students: Student[] | null | undefined;
}

export function ViewStudentsDialog({
  open,
  onClose,
  projectTitle,
  students,
}: ViewStudentsDialogProps) {
  const getFullName = (student: Student) => {
    return student.fullName || student.full_name || "Không có tên";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Danh sách sinh viên</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">{projectTitle}</p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {!students || students.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Chưa có sinh viên nào tham gia đề tài này
              </p>
            </div>
          ) : (
            students.map((student, index) => {
              const fullName = getFullName(student);
              return (
                <div
                  key={student.id || index}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} alt={fullName} />
                    <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{fullName}</h4>
                      <Badge variant="outline" className="text-xs">
                        SV {index + 1}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </div>
                  </div>

                  {(student.studentId || student.student_id) && (
                    <Badge variant="secondary">
                      MSSV: {student.studentId || student.student_id}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
